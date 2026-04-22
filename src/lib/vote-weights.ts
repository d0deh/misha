import type { Owner, Unit, OwnershipLink, AssociationRole } from './types'
import { canVote } from './user-context'

export interface VoterWeight {
  ownerId: string
  rawArea: number
  rawPercentage: number
  cappedPercentage: number
}

/**
 * Compute area-based vote weights for all eligible voters in a building.
 * Per Saudi Article 18.6: weight = owner's total unit area / total subdivided area.
 * If any single owner's share exceeds 50%, cap it at 50% and redistribute.
 */
export function computeVoterWeights(
  owners: Owner[],
  units: Unit[],
  ownershipLinks: OwnershipLink[],
  associationRoles: AssociationRole[]
): VoterWeight[] {
  const totalArea = units.reduce((sum, u) => sum + u.area, 0)
  if (totalArea === 0) return []

  const eligible = owners.filter((o) => {
    const r = associationRoles.find((role) => role.userId === o.id)
    return r ? canVote(r.role) : false
  })

  const weights = eligible.map((owner) => {
    const ownerLinks = ownershipLinks.filter((l) => l.ownerId === owner.id)
    const ownerArea = ownerLinks.reduce((sum, l) => {
      const unit = units.find((u) => u.id === l.unitId)
      return sum + (unit ? unit.area * (l.sharePercentage / 100) : 0)
    }, 0)
    return {
      ownerId: owner.id,
      rawArea: ownerArea,
      rawPercentage: (ownerArea / totalArea) * 100,
      cappedPercentage: 0,
    }
  })

  // Apply 50% cap per Article 18.6
  const CAP = 50
  let excess = 0
  let uncappedTotal = 0

  for (const w of weights) {
    if (w.rawPercentage > CAP) {
      excess += w.rawPercentage - CAP
      w.cappedPercentage = CAP
    } else {
      uncappedTotal += w.rawPercentage
    }
  }

  // If nobody is uncapped, the cap is spurious — it exists to prevent a
  // dominant owner from overriding *other* eligible voters, and there are
  // none. Keep raw weights. (Reachable only when a single eligible voter
  // owns >50%, since raw percentages are shares of total building area.)
  if (excess > 0 && uncappedTotal === 0) {
    for (const w of weights) {
      w.cappedPercentage = w.rawPercentage
    }
    return weights
  }

  // Redistribute excess proportionally to uncapped voters
  for (const w of weights) {
    if (w.rawPercentage <= CAP) {
      const share = uncappedTotal > 0 ? w.rawPercentage / uncappedTotal : 0
      w.cappedPercentage = w.rawPercentage + excess * share
    }
  }

  return weights
}

/** Get a single voter's weight percentage */
export function getVoterWeight(
  voterId: string,
  weights: VoterWeight[]
): number {
  return weights.find((w) => w.ownerId === voterId)?.cappedPercentage ?? 0
}

/** Sum the area weight of all votes cast on a decision */
export function getVotedAreaWeight(
  decisionVotes: { voterId: string }[],
  weights: VoterWeight[]
): number {
  return decisionVotes.reduce((sum, v) => sum + getVoterWeight(v.voterId, weights), 0)
}

/** Compute weighted vote result for a decision */
export function computeWeightedResult(
  votes: { voterId: string; option: 'approve' | 'reject' | 'abstain' }[],
  weights: VoterWeight[]
): {
  approveWeight: number
  rejectWeight: number
  abstainWeight: number
  totalVotedWeight: number
  status: 'approved' | 'rejected'
  resultText: string
} {
  let approveWeight = 0
  let rejectWeight = 0
  let abstainWeight = 0

  for (const v of votes) {
    const w = getVoterWeight(v.voterId, weights)
    if (v.option === 'approve') approveWeight += w
    else if (v.option === 'reject') rejectWeight += w
    else abstainWeight += w
  }

  const totalVotedWeight = approveWeight + rejectWeight + abstainWeight
  // Article 18.6: approved if approve >= 75% of total voted weight
  const approveRatio = totalVotedWeight > 0 ? (approveWeight / totalVotedWeight) * 100 : 0
  const status: 'approved' | 'rejected' = approveRatio >= 75 ? 'approved' : 'rejected'

  const rApprove = Math.round(approveWeight)
  const rReject = Math.round(rejectWeight)

  const resultText =
    status === 'approved'
      ? `تمت الموافقة — صوّت ملاك يمثلون ${rApprove}٪ من المساحة بالموافقة`
      : `رُفض — صوّت ملاك يمثلون ${rReject}٪ من المساحة بالرفض مقابل ${rApprove}٪ موافقة`

  return {
    approveWeight: Math.round(approveWeight * 10) / 10,
    rejectWeight: Math.round(rejectWeight * 10) / 10,
    abstainWeight: Math.round(abstainWeight * 10) / 10,
    totalVotedWeight: Math.round(totalVotedWeight * 10) / 10,
    status,
    resultText,
  }
}
