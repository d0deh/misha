@AGENTS.md

# Project: Misha (مِشاع)

Arabic RTL building management platform for Saudi owner associations. Next.js 16 + shadcn/ui + Base UI. All mock data, no backend.

## Target User

50+ Saudi building chairman. WhatsApp is his most complex app. Every UI element must earn its place. Large touch targets, obvious labels, scannable data. No fancy interactions.

## Language

All user-facing text MUST be Arabic (Modern Standard Arabic). English is only for code — variable names, enum values, CSS classes. Never show English strings to the user.

## RTL

- Use logical CSS properties: `start/end`, `ps/pe`, `ms/me` — NOT `left/right`, `pl/pr`, `ml/mr`
- Exception: `left-1/2 -translate-x-1/2` is correct for physical centering (works in both LTR/RTL)
- Screen-reader text must also be Arabic (e.g. `sr-only` close buttons say "أغلق")
- In flexbox with `justify-between`, the first child renders on the RIGHT (start) in RTL

## Select/Dropdown Components (CRITICAL)

Base UI's `SelectPrimitive.Value` displays the `value` prop (English enum) by default, NOT the SelectItem children text. To show Arabic labels in the trigger after selection, you MUST pass an `items` prop on every `<Select>` component:

```tsx
<Select value={status} onValueChange={setStatus} items={{ new: 'جديد', in_progress: 'قيد التنفيذ', completed: 'مكتمل' }}>
```

Without `items`, the user sees "in_progress" instead of "قيد التنفيذ" after selecting.

## Layout

- **Navigation**: Topbar only (sidebar was removed). Desktop tabs + mobile hamburger + bottom tab bar.
- **Page headers**: Action button FIRST in markup, title SECOND. In RTL this puts the button on the right.
- **Dialog footers**: `DialogFooter` uses `flex-col sm:flex-row sm:justify-start`. Primary button first, cancel second. Primary renders on the right in RTL.

## Design Rules

- No gradients or glassmorphism on data cards — use flat `border-stone-200 bg-white`
- No decorative arrows or icons that don't serve a function
- Status badges use dot + label pattern consistently (colored dot 1.5x1.5 + rounded-full border badge)
- Vote buttons are all neutral/stone-colored when unvoted. Only fill with color (green/red/gray) AFTER the user votes
- "لم تصوّت بعد" uses amber (informational), never red

## Voting System (IMPORTANT)

Voting is **area-weighted per Saudi Article 18.6**, NOT head-count. The logic lives in `src/lib/vote-weights.ts`:

- Each owner's vote weight = their total unit area / total building subdivided area
- If any single owner's share exceeds 50%, it's capped at 50%
- Approval requires ≥75% of total voted area weight
- Progress bars show % of area represented by votes cast
- `computeVoterWeights()` — computes all weights for a building
- `getVotedAreaWeight()` — sums area weight of votes on a decision
- `computeWeightedResult()` — determines approved/rejected with Arabic result text
- `AppDataContext` exposes `voterWeights: VoterWeight[]` for all pages

## Component Structure

Large pages are split into extracted components in the same directory:

- `decisions/page.tsx` — orchestrator (tabs, layout)
  - `decisions/decision-card.tsx` — single decision card with inline vote buttons
  - `decisions/decision-detail-sheet.tsx` — side sheet with vote breakdown + actions
  - `decisions/create-decision-dialog.tsx` — create form dialog
  - `decisions/_constants.ts` — shared style maps
  - `decisions/_whatsapp.ts` — WhatsApp share URL helper

- `maintenance/page.tsx` — orchestrator (filters, table)
  - `maintenance/request-detail-sheet.tsx` — side sheet with workflow + comments
  - `maintenance/create-request-dialog.tsx` — create form dialog
  - `maintenance/_constants.ts` — shared style maps

Extracted components use `useAppData()` and `useUser()` internally — no prop-drilling of context data.

## Data & Labels

Mock data uses English enum keys internally. Arabic labels are provided by helper functions in `src/lib/mock-data.ts`:

- `getRoleLabel()` — chairman, owner, etc.
- `getStatusLabel()` — open, closed, new, in_progress, etc.
- `getPriorityLabel()` — urgent, high, medium, low
- `getCategoryLabel()` — financial, maintenance, governance, general
- `getDocumentTypeLabel()` — statute, minutes, invoice, etc.
- `getVoteOptionLabel()` — approve, reject, abstain

Always use these helpers for display. Never show raw enum values to the user.

## Fee Data

Fees are a first-class entity (`Fee` type in `types.ts`). Fee records live in `mock-data.ts` per building and are exposed via `AppDataContext`. The association page reads from `fees` in context — do NOT compute fees on-the-fly from unit areas.

## Deployment

- GitHub: https://github.com/d0deh/misha
- Vercel: https://misha-self.vercel.app
- Auto-deploys on push to `master`
