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

## Data & Labels

Mock data uses English enum keys internally. Arabic labels are provided by helper functions in `src/lib/mock-data.ts`:

- `getRoleLabel()` — chairman, owner, etc.
- `getStatusLabel()` — open, closed, new, in_progress, etc.
- `getPriorityLabel()` — urgent, high, medium, low
- `getCategoryLabel()` — financial, maintenance, governance, general
- `getDocumentTypeLabel()` — statute, minutes, invoice, etc.
- `getVoteOptionLabel()` — approve, reject, abstain

Always use these helpers for display. Never show raw enum values to the user.
