# Demo Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Misha prototype demo-ready in 2 days with 7 priorities — weighted voting (killer feature), Hijri dates, notification badges, richer mock data, WhatsApp sharing, visual/UX fixes, and component refactoring.

**Architecture:** All changes are client-side. Weighted voting adds area-weight computation to AppDataContext and updates all vote display code. Hijri dates use native `Intl.DateTimeFormat`. Notification badges add a helper + badge component to the topbar. Fee data moves into AppDataContext. No new dependencies needed.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui

---

## Priority 1: Weighted Voting by Unit Area

The Saudi law (Article 18.6) requires ¾ area approval. This changes the entire voting math from head-count to area-weighted.

### Task 1.1: Add vote weight computation helper

**Files:**
- Create: `src/lib/vote-weights.ts`

This is a pure utility with no UI. It computes each owner's voting weight based on their total unit area as a fraction of total building subdivided area, with a 50% cap if any single owner exceeds half.

- [ ] **Step 1: Create `src/lib/vote-weights.ts`**

```typescript
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
      cappedPercentage: 0, // computed below
    }
  })

  // Apply 50% cap
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
  const status = approveRatio >= 75 ? 'approved' : 'rejected'

  const resultText =
    status === 'approved'
      ? `تمت الموافقة — صوّت ملاك يمثلون ${Math.round(approveWeight)}٪ من المساحة بالموافقة`
      : `رُفض — صوّت ملاك يمثلون ${Math.round(rejectWeight)}٪ من المساحة بالرفض مقابل ${Math.round(approveWeight)}٪ موافقة`

  return {
    approveWeight: Math.round(approveWeight * 10) / 10,
    rejectWeight: Math.round(rejectWeight * 10) / 10,
    abstainWeight: Math.round(abstainWeight * 10) / 10,
    totalVotedWeight: Math.round(totalVotedWeight * 10) / 10,
    status,
    resultText,
  }
}
```

- [ ] **Step 2: Commit**

### Task 1.2: Update AppDataContext to use weighted voting

**Files:**
- Modify: `src/lib/app-data-context.tsx`

Replace head-count `eligibleVoterCount` with `voterWeights` array. Update `computeResult` to use `computeWeightedResult`. Update auto-close trigger to check vote count against eligible voter count (still head-count for "everyone voted" detection).

Key changes:
1. Import `computeVoterWeights` and `computeWeightedResult` from vote-weights.ts
2. Replace `eligibleVoterCount` (number) with `voterWeights` (VoterWeight[]) computed via `computeVoterWeights(data.owners, data.units, data.ownershipLinks, data.associationRoles)`
3. Derive `eligibleVoterCount = voterWeights.length` for auto-close detection
4. Replace `computeResult` body to call `computeWeightedResult(dVotes, voterWeights)` and return the weighted status + resultText
5. Expose `voterWeights` in the context type so pages can access per-voter weights

### Task 1.3: Update decisions page vote display

**Files:**
- Modify: `src/app/buildings/[id]/decisions/page.tsx`

Key changes:
1. Get `voterWeights` from `useAppData()`
2. Import `getVoterWeight` from vote-weights.ts
3. Replace progress calculation: instead of `decisionVotes.length / eligibleVoters`, compute `votedAreaWeight` = sum of `getVoterWeight(v.voterId, voterWeights)` for each vote cast on that decision
4. Progress bar shows `votedAreaWeight` percentage (area voted / total eligible area)
5. Text changes: `"صوّت {decisionVotes.length} من {eligibleVoters}"` → `"صوّت ملاك يمثلون {Math.round(votedAreaWeight)}٪ من المساحة ({decisionVotes.length} ملاك)"`
6. In the sheet vote breakdown, add weight column: each voter row shows `"{voterName} — {weight}٪"` alongside their vote option
7. Summary box: show weighted percentages `"{approveWeight}٪ موافق · {rejectWeight}٪ رافض · {abstainWeight}٪ ممتنع"`

### Task 1.4: Update dashboard vote display

**Files:**
- Modify: `src/app/buildings/[id]/page.tsx`

Same pattern as 1.3 but for the dashboard's decision cards:
1. Get `voterWeights` from `useAppData()`
2. Import `getVoterWeight` from vote-weights.ts
3. Replace progress box: percentage shows area-weighted progress
4. Progress bar width uses weighted percentage
5. Text: `"{votedAreaWeight}٪"` and `"صوّت ملاك يمثلون {Math.round(votedAreaWeight)}٪ من المساحة"` with secondary `"({voteCount} ملاك)"`

### Task 1.5: Commit + build verify

---

## Priority 2: Hijri Date + Personalized Greeting

### Task 2.1: Add greeting section to dashboard

**Files:**
- Modify: `src/app/buildings/[id]/page.tsx`

Add above the attention banner (first element in the page):

```typescript
// Greeting logic
const hour = new Date().getHours()
const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير'
const firstName = userName.split(' ')[0]

// Hijri date
const hijriDate = new Intl.DateTimeFormat('ar-SA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  calendar: 'islamic-umalqura',
}).format(new Date())
```

Render as two compact lines at the top of the page, before the attention banner:
```tsx
<div className="flex items-baseline justify-between">
  <div>
    <p className="text-lg font-semibold text-stone-900">{greeting} {firstName}</p>
    <p className="text-sm text-stone-500">{hijriDate}</p>
  </div>
</div>
```

### Task 2.2: Commit + build verify

---

## Priority 3: Notification Badges on Nav Items

### Task 3.1: Add badge counts computation to topbar

**Files:**
- Modify: `src/components/layout/topbar.tsx`

The topbar needs access to AppDataContext for counts. Add `useAppData()` and compute badge counts:

1. Import `useAppData` and permission helpers (`canVote`, `canManageMaintenance`)
2. Compute per-nav-item badge counts:
   - **القرارات**: `canVote(role) ? getDecisionsAwaitingVote(userId).length : 0`
   - **الصيانة**: `canManageMaintenance(role) ? requests.filter(r => r.status === 'new' || r.priority === 'urgent').length : ownUnresolved`
   - **المستندات**: `documents.filter(d => Date.now() - new Date(d.createdAt).getTime() < 7 * 86400000).length`
3. Attach `badge?: number` to each nav item
4. Render badge as `{badge > 0 && <span className="absolute -top-1 -start-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{badge}</span>}` on the icon container (needs `relative` on parent)
5. Apply in all 3 nav renderings: desktop, mobile dropdown, mobile bottom bar

### Task 3.2: Commit + build verify

---

## Priority 4: Richer Mock Data + Real Fees

### Task 4.1: Add Fee type and fee data to context

**Files:**
- Modify: `src/lib/types.ts` — add `Fee` interface
- Modify: `src/lib/mock-data.ts` — add fee arrays per building, enrich descriptions
- Modify: `src/lib/app-data-context.tsx` — expose `fees` in context

New Fee type:
```typescript
export interface Fee {
  id: string
  ownerId: string
  buildingId: string
  annualAmount: number
  paidAmount: number
  status: 'paid' | 'partial' | 'unpaid'
  lastPaymentDate?: string
}
```

Add to BuildingDataset. Generate fee records per building based on owner areas × 50 SAR/m² with ~60% paid, ~25% partial, ~15% unpaid distribution using deterministic assignment.

### Task 4.2: Update association page to use real fee data

**Files:**
- Modify: `src/app/buildings/[id]/association/page.tsx`

Replace the current `getOwnerFeeStatus()` hash function and computed `feesData` with data from context `fees` array. Add a collection rate progress bar below the summary stats.

### Task 4.3: Enrich mock data descriptions

**Files:**
- Modify: `src/lib/mock-data.ts`

Replace generic descriptions across all 3 buildings:
- Maintenance titles: "تسرب مياه من سقف الطابق الثالث", "عطل في نظام الإنذار", "كسر في بلاط مدخل المبنى", "صيانة دورية للمصاعد", "تعطل مضخة المياه", "خلل في إضاءة الممرات"
- Decision titles: realistic Saudi HOA topics
- Document titles: "عقد صيانة المصاعد ٢٠٢٦", "فاتورة كهرباء مارس", "محضر الجمعية العمومية"
- Activity log: coherent 3-month story

### Task 4.4: Commit + build verify

---

## Priority 5: WhatsApp Share Button

### Task 5.1: Add WhatsApp share to closed decisions

**Files:**
- Modify: `src/app/buildings/[id]/decisions/page.tsx`

Add a share button on closed decisions in both card view and sheet view.

Message format:
```
🏢 مِشاع — نتيجة تصويت

القرار: {title}
النتيجة: {status === 'approved' ? 'موافقة' : 'مرفوض'}
التصويت: {approveWeight}٪ موافق · {rejectWeight}٪ رافض · {abstainWeight}٪ ممتنع
المبنى: {building.name}
التاريخ: {formattedDate}
```

Button: green bg (#25D366), share icon, text "مشاركة عبر واتساب"
Opens: `https://wa.me/?text=${encodeURIComponent(message)}`

Place in card view (after the disclaimer) and in sheet view (after the result section).

### Task 5.2: Commit + build verify

---

## Priority 6: Visual/UX Fixes

### Task 6.1: Fix action button positions (RTL)

**Files:** All page headers in decisions, maintenance, association, documents, units pages

Currently buttons are first in flex order which places them LEFT in RTL with `justify-between`. For RTL, the action button should be START (right). The current code already puts button first + heading second, and with `justify-between` in RTL, button is on RIGHT and heading on LEFT. **Verify** this is actually correct by re-reading — in RTL flex, the first child goes to the inline-start (RIGHT). If buttons are already on the right, no change needed.

### Task 6.2: Fix vote button styling

**Files:**
- Modify: `src/app/buildings/[id]/decisions/page.tsx`

All three vote buttons should be identical neutral/outline style when unvoted. Only fill with color after the user selects. Current `inactiveClass` is already `'border-stone-300 text-stone-700 hover:bg-stone-50'` for all three — this is correct. The `activeClass` fills with color — also correct. **Verify** no asymmetry exists.

### Task 6.3: Fix "لم تصوّت بعد" styling

**Files:**
- Modify: `src/app/buildings/[id]/decisions/page.tsx`

Verify it's amber, not red. Current code (line ~330): `text-amber-700` — already correct. No change needed.

### Task 6.4: Shrink dashboard command cards section

**Files:**
- Modify: `src/app/buildings/[id]/page.tsx`

The 4 command cards currently take full width in a grid. They should be more compact:
- Reduce padding from `p-4` to `p-3`
- Reduce value size from `text-3xl` to `text-2xl`
- Reduce gap between sections

### Task 6.5: Fix role switcher dropdown

**Files:**
- Modify: `src/components/layout/topbar.tsx`

No 2-letter initials exist in current code (the audit may have been based on an earlier version). The dropdown shows `owner?.fullName.split(' ').slice(0, 3).join(' ')` + role label. Verify and clean up if needed.

### Task 6.6: Fix association "ممثل" badge

**Files:**
- Modify: `src/app/buildings/[id]/association/page.tsx`

The "ممثل" badge in the owners table (line ~252) checks `isPrimaryRepresentative` on ownershipLinks where multiple owners share a unit. Verify the logic only shows for multi-owner units.

### Task 6.7: Fix filter dropdown defaults

All filter selects should show "الكل" as the default text when empty. Verify SelectValue placeholder props across maintenance and documents pages.

### Task 6.8: Verify no English values in dropdowns

Check all Select components with `items` prop — ensure Arabic values are shown for all user-facing selections.

### Task 6.9: Commit + build verify

---

## Priority 7: Break Up Large Page Components

### Task 7.1: Split decisions page

**Files:**
- Create: `src/app/buildings/[id]/decisions/create-decision-dialog.tsx`
- Create: `src/app/buildings/[id]/decisions/decision-detail-sheet.tsx`
- Create: `src/app/buildings/[id]/decisions/decision-card.tsx`
- Modify: `src/app/buildings/[id]/decisions/page.tsx` — orchestrator only

Extract:
1. `CreateDecisionDialog` — form state + dialog JSX
2. `DecisionDetailSheet` — sheet with vote breakdown, vote buttons, close action
3. `DecisionCard` — single decision card rendering with inline vote buttons

Page keeps: tab state, filtering, layout.

### Task 7.2: Split maintenance page

**Files:**
- Create: `src/app/buildings/[id]/maintenance/create-request-dialog.tsx`
- Create: `src/app/buildings/[id]/maintenance/request-detail-sheet.tsx`
- Create: `src/app/buildings/[id]/maintenance/request-row.tsx`
- Modify: `src/app/buildings/[id]/maintenance/page.tsx` — orchestrator only

Extract:
1. `CreateRequestDialog` — form state + dialog JSX
2. `RequestDetailSheet` — sheet with status workflow, vendor/cost, comments
3. `RequestRow` — single table row rendering

Page keeps: filter state, view mode, table layout.

### Task 7.3: Commit + build verify

---

## Execution Order

1. **Priority 1** (Tasks 1.1-1.5) — Weighted voting — the killer feature
2. **Priority 2** (Tasks 2.1-2.2) — Hijri date + greeting
3. **Priority 3** (Tasks 3.1-3.2) — Notification badges
4. **Priority 4** (Tasks 4.1-4.4) — Richer mock data + real fees
5. **Priority 5** (Tasks 5.1-5.2) — WhatsApp share
6. **Priority 6** (Tasks 6.1-6.9) — Visual/UX fixes
7. **Priority 7** (Tasks 7.1-7.3) — Component refactoring (last, invisible to user)
