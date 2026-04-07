# مِشاع (Misha)

Saudi HOA management platform for owner associations. Day-to-day operational dashboard — not a government replacement.

**Live demo:** https://misha-self.vercel.app

## What is this?

Misha helps run shared residential buildings in Saudi Arabia:
- **Voting** — Area-weighted per Saudi Article 18.6 (75% approval threshold, 50% cap)
- **Maintenance** — Request lifecycle with vendor assignment, cost tracking, comments
- **Association** — Board roles, owner registry, fee tracking with collection rates
- **Documents** — Upload with visibility controls (everyone / board only / owners only)
- **Dashboard** — Hijri date, personalized greeting, notification badges, activity timeline

## Roles

| Role | Arabic | Can vote | Can manage |
|------|--------|----------|------------|
| Chairman | رئيس الجمعية | Yes | Everything |
| Vice Chairman | نائب الرئيس | Yes | Everything |
| Board Member | عضو مجلس إدارة | Yes | View only |
| Manager | مدير العقار | No | Maintenance + docs |
| Owner | مالك | Yes | Own units |
| Resident | مقيم | No | Own unit maintenance |

Use the role switcher in the topbar to demo different perspectives.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui + Base UI
- Arabic RTL with Readex Pro font
- Client-side only (mock data, no backend)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
  app/
    buildings/          # Building selector
    buildings/[id]/     # Per-building pages
      page.tsx          # Dashboard
      decisions/        # Voting (split into components)
      maintenance/      # Requests (split into components)
      association/      # Members + fees
      units/            # Building units
      documents/        # Document library
  components/
    layout/topbar.tsx   # Navigation + badges
    ui/                 # shadcn/ui components
  lib/
    types.ts            # All TypeScript interfaces
    mock-data.ts        # 3 buildings with mock data
    app-data-context.tsx # Global state + mutations
    user-context.tsx    # User roles + permissions
    vote-weights.ts     # Area-weighted voting logic
```

## Status

This is a **prototype/demo** — all data is client-side and resets on refresh. No authentication, no backend, no real file uploads.
