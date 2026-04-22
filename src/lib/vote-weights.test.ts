import { describe, it, expect } from 'vitest'
import type { Owner, Unit, OwnershipLink, AssociationRole } from './types'
import {
  computeVoterWeights,
  getVoterWeight,
  getVotedAreaWeight,
  computeWeightedResult,
} from './vote-weights'

// ─── Fixture helpers ────────────────────────────────────────────────────────
// Small hand-built fixtures. We avoid importing the 1,649-line mock-data.ts so
// tests exercise vote-weights in isolation and don't drift with seed changes.

function owner(id: string): Owner {
  return {
    id,
    fullName: id,
    phone: '',
    email: '',
    nationalIdPlaceholder: '',
  }
}

function unit(id: string, area: number): Unit {
  return {
    id,
    buildingId: 'b1',
    unitNumber: id,
    floor: 1,
    area,
    ownershipSharePercentage: 100,
    occupancyStatus: 'occupied',
  }
}

function link(
  id: string,
  ownerId: string,
  unitId: string,
  sharePercentage = 100
): OwnershipLink {
  return {
    id,
    ownerId,
    unitId,
    sharePercentage,
    isPrimaryRepresentative: true,
  }
}

function role(userId: string, r: AssociationRole['role']): AssociationRole {
  return { id: `r-${userId}`, userId, associationId: 'a1', role: r }
}

const OWNER_ROLE: AssociationRole['role'] = 'owner'

/**
 * Build an eligible-owner scenario where each owner solely owns one unit
 * sized proportional to their target raw percentage.
 */
function buildScenario(
  ownerShares: { id: string; rawPct: number; role?: AssociationRole['role'] }[]
) {
  const owners = ownerShares.map((o) => owner(o.id))
  const units = ownerShares.map((o) => unit(`u-${o.id}`, o.rawPct))
  const links = ownerShares.map((o, i) =>
    link(`l-${o.id}`, o.id, `u-${o.id}`, 100)
  )
  const roles = ownerShares.map((o) => role(o.id, o.role ?? OWNER_ROLE))
  return { owners, units, links, roles }
}

const closeTo = (actual: number, expected: number, tol = 0.0001) => {
  expect(Math.abs(actual - expected)).toBeLessThan(tol)
}

// ─── computeVoterWeights — basic math ──────────────────────────────────────

describe('computeVoterWeights — basic math', () => {
  it('two equal owners at 50%/50% get 50% each, cap not triggered', () => {
    const { owners, units, links, roles } = buildScenario([
      { id: 'a', rawPct: 50 },
      { id: 'b', rawPct: 50 },
    ])
    const w = computeVoterWeights(owners, units, links, roles)
    expect(w).toHaveLength(2)
    closeTo(w[0].cappedPercentage, 50)
    closeTo(w[1].cappedPercentage, 50)
    closeTo(w[0].rawPercentage, 50)
  })

  it('three owners 70/20/10: 70 caps to 50, excess 20 redistributes proportionally', () => {
    const { owners, units, links, roles } = buildScenario([
      { id: 'a', rawPct: 70 },
      { id: 'b', rawPct: 20 },
      { id: 'c', rawPct: 10 },
    ])
    const w = computeVoterWeights(owners, units, links, roles)
    const byId = Object.fromEntries(w.map((x) => [x.ownerId, x]))
    closeTo(byId.a.cappedPercentage, 50)
    // b: 20 + 20 * (20/30) = 33.333...
    closeTo(byId.b.cappedPercentage, 20 + 20 * (20 / 30))
    // c: 10 + 20 * (10/30) = 16.666...
    closeTo(byId.c.cappedPercentage, 10 + 20 * (10 / 30))
    // sum equals 100
    closeTo(
      w.reduce((s, x) => s + x.cappedPercentage, 0),
      100
    )
  })

  it('four owners 60/20/15/5: 60 caps to 50, excess 10 redistributes across 40 uncapped', () => {
    const { owners, units, links, roles } = buildScenario([
      { id: 'a', rawPct: 60 },
      { id: 'b', rawPct: 20 },
      { id: 'c', rawPct: 15 },
      { id: 'd', rawPct: 5 },
    ])
    const w = computeVoterWeights(owners, units, links, roles)
    const byId = Object.fromEntries(w.map((x) => [x.ownerId, x]))
    closeTo(byId.a.cappedPercentage, 50)
    closeTo(byId.b.cappedPercentage, 20 + 10 * (20 / 40)) // 25
    closeTo(byId.c.cappedPercentage, 15 + 10 * (15 / 40)) // 18.75
    closeTo(byId.d.cappedPercentage, 5 + 10 * (5 / 40)) // 6.25
    closeTo(
      w.reduce((s, x) => s + x.cappedPercentage, 0),
      100
    )
  })
})

// ─── computeVoterWeights — cap boundary ────────────────────────────────────

describe('computeVoterWeights — cap boundary (strict >)', () => {
  it('owner at exactly 50% is NOT capped', () => {
    const { owners, units, links, roles } = buildScenario([
      { id: 'a', rawPct: 50 },
      { id: 'b', rawPct: 30 },
      { id: 'c', rawPct: 20 },
    ])
    const w = computeVoterWeights(owners, units, links, roles)
    const a = w.find((x) => x.ownerId === 'a')!
    // no excess to redistribute; a stays at its raw 50
    closeTo(a.cappedPercentage, 50)
    closeTo(a.rawPercentage, 50)
  })

  it('owner at 50.01% IS capped', () => {
    const { owners, units, links, roles } = buildScenario([
      { id: 'a', rawPct: 50.01 },
      { id: 'b', rawPct: 49.99 },
    ])
    const w = computeVoterWeights(owners, units, links, roles)
    const a = w.find((x) => x.ownerId === 'a')!
    closeTo(a.cappedPercentage, 50)
  })
})

// ─── computeVoterWeights — single-eligible-voter edge case (bug fix) ───────

describe('computeVoterWeights — single eligible voter over cap', () => {
  it('sole eligible voter owning 60% keeps 60% (cap is spurious with no others)', () => {
    // 60% owned by A (eligible), 40% by a resident (ineligible)
    const owners = [owner('a'), owner('tenant')]
    const units = [unit('u1', 60), unit('u2', 40)]
    const links = [link('l1', 'a', 'u1'), link('l2', 'tenant', 'u2')]
    const roles = [role('a', 'owner'), role('tenant', 'resident')]
    const w = computeVoterWeights(owners, units, links, roles)
    expect(w).toHaveLength(1)
    closeTo(w[0].cappedPercentage, 60)
    closeTo(w[0].rawPercentage, 60)
  })

  it('sole eligible voter owning exactly 50% stays at 50% (cap never triggers)', () => {
    const owners = [owner('a'), owner('tenant')]
    const units = [unit('u1', 50), unit('u2', 50)]
    const links = [link('l1', 'a', 'u1'), link('l2', 'tenant', 'u2')]
    const roles = [role('a', 'owner'), role('tenant', 'resident')]
    const w = computeVoterWeights(owners, units, links, roles)
    expect(w).toHaveLength(1)
    closeTo(w[0].cappedPercentage, 50)
  })

  it('sole eligible voter owning 100% gets 100% weight', () => {
    const owners = [owner('a')]
    const units = [unit('u1', 100)]
    const links = [link('l1', 'a', 'u1')]
    const roles = [role('a', 'owner')]
    const w = computeVoterWeights(owners, units, links, roles)
    expect(w).toHaveLength(1)
    closeTo(w[0].cappedPercentage, 100)
  })
})

// ─── computeVoterWeights — filtering & edge inputs ─────────────────────────

describe('computeVoterWeights — filtering and edge inputs', () => {
  it('non-voting roles (resident, manager) are excluded from weights', () => {
    const owners = [owner('a'), owner('b'), owner('c')]
    const units = [unit('u1', 40), unit('u2', 30), unit('u3', 30)]
    const links = [
      link('l1', 'a', 'u1'),
      link('l2', 'b', 'u2'),
      link('l3', 'c', 'u3'),
    ]
    const roles = [
      role('a', 'owner'),
      role('b', 'resident'),
      role('c', 'manager'),
    ]
    const w = computeVoterWeights(owners, units, links, roles)
    expect(w.map((x) => x.ownerId)).toEqual(['a'])
  })

  it('ownership link to a missing unit contributes 0 area', () => {
    const owners = [owner('a'), owner('b')]
    const units = [unit('u1', 50)] // u2 missing
    const links = [link('l1', 'a', 'u1'), link('l2', 'b', 'u2')]
    const roles = [role('a', 'owner'), role('b', 'owner')]
    const w = computeVoterWeights(owners, units, links, roles)
    const a = w.find((x) => x.ownerId === 'a')!
    const b = w.find((x) => x.ownerId === 'b')!
    closeTo(a.rawArea, 50)
    closeTo(b.rawArea, 0)
  })

  it('zero total area returns empty array, does not throw', () => {
    const owners = [owner('a')]
    const units: Unit[] = []
    const links: OwnershipLink[] = []
    const roles = [role('a', 'owner')]
    expect(() => computeVoterWeights(owners, units, links, roles)).not.toThrow()
    expect(computeVoterWeights(owners, units, links, roles)).toEqual([])
  })

  it('owner with multiple ownership links has areas summed', () => {
    const owners = [owner('a'), owner('b')]
    const units = [unit('u1', 30), unit('u2', 30), unit('u3', 40)]
    const links = [
      link('l1', 'a', 'u1'), // 30
      link('l2', 'a', 'u2'), // 30
      link('l3', 'b', 'u3'), // 40
    ]
    const roles = [role('a', 'owner'), role('b', 'owner')]
    const w = computeVoterWeights(owners, units, links, roles)
    const a = w.find((x) => x.ownerId === 'a')!
    closeTo(a.rawArea, 60)
    closeTo(a.rawPercentage, 60)
  })

  it('fractional ownership share contributes proportional area', () => {
    // Two owners split u1 50/50; third owns u2 fully.
    const owners = [owner('a'), owner('b'), owner('c')]
    const units = [unit('u1', 80), unit('u2', 20)]
    const links = [
      link('l1', 'a', 'u1', 50), // 40 of u1
      link('l2', 'b', 'u1', 50), // 40 of u1
      link('l3', 'c', 'u2', 100), // 20
    ]
    const roles = [role('a', 'owner'), role('b', 'owner'), role('c', 'owner')]
    const w = computeVoterWeights(owners, units, links, roles)
    const a = w.find((x) => x.ownerId === 'a')!
    const b = w.find((x) => x.ownerId === 'b')!
    const c = w.find((x) => x.ownerId === 'c')!
    closeTo(a.rawArea, 40)
    closeTo(b.rawArea, 40)
    closeTo(c.rawArea, 20)
    closeTo(a.rawPercentage, 40)
  })
})

// ─── getVotedAreaWeight ────────────────────────────────────────────────────

describe('getVotedAreaWeight', () => {
  const { owners, units, links, roles } = buildScenario([
    { id: 'a', rawPct: 70 },
    { id: 'b', rawPct: 20 },
    { id: 'c', rawPct: 10 },
  ])
  const weights = computeVoterWeights(owners, units, links, roles)

  it('sums cappedPercentage across voters who cast votes', () => {
    const votedByAll = [{ voterId: 'a' }, { voterId: 'b' }, { voterId: 'c' }]
    closeTo(getVotedAreaWeight(votedByAll, weights), 100)
  })

  it('returns 0 for a decision with no votes', () => {
    expect(getVotedAreaWeight([], weights)).toBe(0)
  })

  it('voter missing from weights contributes 0, does not throw', () => {
    const votes = [{ voterId: 'a' }, { voterId: 'ghost' }]
    const total = getVotedAreaWeight(votes, weights)
    // only a's weight contributes
    closeTo(total, getVoterWeight('a', weights))
  })
})

// ─── computeWeightedResult — approval threshold (>=75) ─────────────────────

describe('computeWeightedResult — approval threshold', () => {
  // Three owners 75 / 20 / 5 — after capping: a=50, b=20+25*(20/25)=40, c=5+25*(5/25)=10
  // Actually: raw a=75, b=20, c=5. cap a -> 50, excess=25, uncappedTotal=25.
  // b: 20 + 25*(20/25) = 20+20 = 40. c: 5 + 25*(5/25) = 10. sum=100. good.
  const { owners, units, links, roles } = buildScenario([
    { id: 'a', rawPct: 75 },
    { id: 'b', rawPct: 20 },
    { id: 'c', rawPct: 5 },
  ])
  const weights = computeVoterWeights(owners, units, links, roles)
  // weights: a=50, b=40, c=10

  it('approve=50 (a) + abstain=40 (b) + reject=10 (c): approveRatio=50%, rejected', () => {
    const result = computeWeightedResult(
      [
        { voterId: 'a', option: 'approve' },
        { voterId: 'b', option: 'abstain' },
        { voterId: 'c', option: 'reject' },
      ],
      weights
    )
    expect(result.status).toBe('rejected')
  })

  it('exactly 75% approve ratio → approved (threshold is >=)', () => {
    // Use a=50 approve + b=40 approve vs c=30 reject scenario.
    // Need: approve/(approve+reject+abstain) === 0.75 exactly.
    // Construct: approve=75, reject=25, abstain=0 → 75%.
    // Using weights a=50, b=40, c=10: approve=a+b=90, reject=c=10 → 90/100 = 90%.
    // Not exactly 75. Build a cleaner fixture.
    const scen = buildScenario([
      { id: 'x', rawPct: 75 },
      { id: 'y', rawPct: 25 },
    ])
    // After cap: x -> 50, excess=25 redistributes to y (uncappedTotal=25): y=25+25=50.
    const ws = computeVoterWeights(scen.owners, scen.units, scen.links, scen.roles)
    // Both at 50. We need 75% approve. Use three voters to reach exactness.

    // Simpler: construct weights manually matching VoterWeight shape.
    const manual = [
      { ownerId: 'p', rawArea: 0, rawPercentage: 0, cappedPercentage: 75 },
      { ownerId: 'q', rawArea: 0, rawPercentage: 0, cappedPercentage: 25 },
    ]
    const res = computeWeightedResult(
      [
        { voterId: 'p', option: 'approve' },
        { voterId: 'q', option: 'reject' },
      ],
      manual
    )
    expect(res.status).toBe('approved')
    expect(res.approveWeight).toBe(75)
    expect(res.rejectWeight).toBe(25)
    // ws is a compute-only sanity check the fixture still exists
    expect(ws).toHaveLength(2)
  })

  it('just under 75% (74.99%) → rejected', () => {
    const manual = [
      { ownerId: 'p', rawArea: 0, rawPercentage: 0, cappedPercentage: 74.99 },
      { ownerId: 'q', rawArea: 0, rawPercentage: 0, cappedPercentage: 25.01 },
    ]
    const res = computeWeightedResult(
      [
        { voterId: 'p', option: 'approve' },
        { voterId: 'q', option: 'reject' },
      ],
      manual
    )
    expect(res.status).toBe('rejected')
  })

  it('100% approve → approved', () => {
    const result = computeWeightedResult(
      [
        { voterId: 'a', option: 'approve' },
        { voterId: 'b', option: 'approve' },
        { voterId: 'c', option: 'approve' },
      ],
      weights
    )
    expect(result.status).toBe('approved')
    closeTo(result.approveWeight, 100)
  })

  it('zero votes → totalVotedWeight=0, status=rejected (no-quorum fallthrough)', () => {
    const result = computeWeightedResult([], weights)
    expect(result.totalVotedWeight).toBe(0)
    expect(result.approveWeight).toBe(0)
    expect(result.status).toBe('rejected')
  })

  it('abstain counts toward totalVotedWeight denominator (dilutes approve ratio)', () => {
    // a approves (50), b abstains (40), c doesn't vote.
    // approve=50, abstain=40, reject=0. total=90. ratio=50/90 ≈ 55.5% → rejected.
    const result = computeWeightedResult(
      [
        { voterId: 'a', option: 'approve' },
        { voterId: 'b', option: 'abstain' },
      ],
      weights
    )
    closeTo(result.approveWeight, 50)
    closeTo(result.abstainWeight, 40)
    expect(result.rejectWeight).toBe(0)
    closeTo(result.totalVotedWeight, 90)
    expect(result.status).toBe('rejected')
  })
})

// ─── computeWeightedResult — output shape ──────────────────────────────────

describe('computeWeightedResult — output shape', () => {
  const { owners, units, links, roles } = buildScenario([
    { id: 'a', rawPct: 75 },
    { id: 'b', rawPct: 20 },
    { id: 'c', rawPct: 5 },
  ])
  const weights = computeVoterWeights(owners, units, links, roles)
  // a=50, b=40, c=10

  it('resultText is Arabic and includes rounded percentage when approved', () => {
    const result = computeWeightedResult(
      [
        { voterId: 'a', option: 'approve' },
        { voterId: 'b', option: 'approve' },
        { voterId: 'c', option: 'approve' },
      ],
      weights
    )
    expect(result.resultText).toContain('تمت الموافقة')
    expect(result.resultText).toContain('100')
    expect(result.resultText).toContain('٪')
  })

  it('resultText is Arabic and includes both reject and approve percentages when rejected', () => {
    const result = computeWeightedResult(
      [
        { voterId: 'a', option: 'reject' },
        { voterId: 'b', option: 'approve' },
        { voterId: 'c', option: 'approve' },
      ],
      weights
    )
    // a=50 reject, b+c=50 approve → ratio = 50/100 = 50% → rejected
    expect(result.resultText).toContain('رُفض')
    expect(result.resultText).toContain('50')
  })

  it('returned weights are rounded to 1 decimal place', () => {
    // Introduce a fractional weight via custom manual weights
    const manual = [
      { ownerId: 'p', rawArea: 0, rawPercentage: 0, cappedPercentage: 33.333 },
      { ownerId: 'q', rawArea: 0, rawPercentage: 0, cappedPercentage: 66.667 },
    ]
    const res = computeWeightedResult(
      [
        { voterId: 'p', option: 'approve' },
        { voterId: 'q', option: 'reject' },
      ],
      manual
    )
    expect(res.approveWeight).toBe(33.3)
    expect(res.rejectWeight).toBe(66.7)
  })
})
