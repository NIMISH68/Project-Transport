# TransitOps — Smart Transport Operations Platform

A full frontend for the TransitOps hackathon brief: fleet, driver, dispatch,
maintenance and expense management with enforced business rules and an
"old money" visual identity — beige & navy in light mode, black & blue in
dark mode, set in Playfair Display / EB Garamond / IBM Plex Mono, with
GSAP + Framer Motion animation throughout.

## Stack
- React 19 + Vite
- Tailwind CSS (custom "ledger" design tokens — see `tailwind.config.js`)
- React Router (client-side routing + protected routes)
- Framer Motion (page/modal/table transitions)
- GSAP (KPI count-ups, sidebar stagger, login sequence)
- Recharts (dashboard & report charts)
- Lucide icons

All data is in-memory mock state (`src/data/seed.js` + `src/context/DataContext.jsx`),
wired to the mandatory business rules (unique reg. no., dispatch eligibility,
cargo capacity, automatic status transitions, maintenance lock-out, etc.),
so the whole lifecycle in the brief's example workflow can be exercised
end-to-end. Swap `DataContext` for real API calls when a backend is ready.

## Getting started
```bash
npm install
npm run dev
```
Then open the printed local URL. Sign in using one of the four demo personas
shown on the login screen (Fleet Manager, Driver/Dispatcher, Safety Officer,
Financial Analyst) — click a card to autofill credentials, all use the
password `demo1234`.

## Pages
- **Dashboard** — KPIs (active/available/in-shop vehicles, active/pending
  trips, drivers on duty, fleet utilization) with type/status/region filters
  and two charts.
- **Vehicle Registry** — CRUD with unique registration-number enforcement,
  search, status filter, retire action.
- **Driver Management** — profiles, license expiry flagging, safety score
  bars, inline status control.
- **Trip Manifest** — create (Draft), Dispatch, Complete, Cancel — every
  transition runs through the same validation used server-side in a real
  deployment (capacity, license validity, double-booking, etc.).
- **Maintenance** — opening a record locks a vehicle into "In Shop" and
  removes it from the dispatch pool; closing releases it back to Available.
- **Fuel & Expenses** — fuel log entry, other expense entry, and a computed
  per-vehicle operational cost table.
- **Reports & Analytics** — fuel efficiency, utilization trend, operational
  cost and vehicle ROI, with CSV export.

## Role-based access
Every signed-in user can view every page (matching the brief's four
personas), but mutating actions are gated per role in
`src/utils/permissions.js` — e.g. only the Fleet Manager can register or
retire vehicles, only the Safety Officer can edit driver compliance status,
only the Dispatcher (Driver role in the brief) can create/dispatch trips,
and only the Financial Analyst can log expenses.

## Notes
- Dark mode toggle lives in the top bar (also respects system preference on
  first load).
- Numbers use `IBM Plex Mono` with tabular figures for a ledger feel.
- This is a frontend-only deliverable; hook `DataContext` up to your API of
  choice to persist data.
