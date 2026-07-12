# TransitOps — Backend

Express + JSON-file (lowdb) backend for the TransitOps hackathon build. No database
server to install — `npm install` and it runs.

## Setup

```bash
cd transitops-backend
npm install
cp .env.example .env
npm run seed      # creates data/db.json with one login per role + demo fleet
npm start          # http://localhost:4000
```

Demo logins (password for all: `password123`):

| Role | Email |
|---|---|
| Fleet Manager | fleet.manager@transitops.dev |
| Driver | driver@transitops.dev |
| Safety Officer | safety.officer@transitops.dev |
| Financial Analyst | finance@transitops.dev |

To reset all data, delete `data/db.json` and run `npm run seed` again.

## Frontend wiring

Point your frontend's API base at `http://localhost:4000/api`. Every protected
route expects `Authorization: Bearer <token>` from the `/auth/login` response.
Set `CORS_ORIGIN` in `.env` to your frontend's dev URL (defaults to
`http://localhost:5173`, Vite's default).

## Roles & permissions

| Action | Allowed roles |
|---|---|
| Create/edit/delete vehicles, open/close maintenance | `fleet_manager` |
| Create/edit/delete drivers | `safety_officer`, `fleet_manager` |
| Create/dispatch/complete/cancel trips | `driver`, `fleet_manager` |
| Log fuel / expenses | `financial_analyst`, `fleet_manager` |
| Read (GET) anything, dashboard, reports | any authenticated user |

## API reference

### Auth
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/register` — `{ name, email, password, role }` (demo convenience; wire this to an admin-only screen in production)
- `GET /api/auth/me` — current user from token

### Vehicles
- `GET /api/vehicles?type=&status=&region=`
- `GET /api/vehicles/:id`
- `POST /api/vehicles` — `{ regNumber, name, type, maxLoadKg, odometerKm, acquisitionCost, region }`
- `PUT /api/vehicles/:id`
- `DELETE /api/vehicles/:id`

### Drivers
- `GET /api/drivers?status=&licenseCategory=`
- `GET /api/drivers/:id`
- `POST /api/drivers` — `{ name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore }`
- `PUT /api/drivers/:id`
- `DELETE /api/drivers/:id`

### Trips
- `GET /api/trips?status=&vehicleId=&driverId=`
- `GET /api/trips/:id`
- `POST /api/trips` — `{ source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, revenue }` → creates a `Draft` trip
- `PATCH /api/trips/:id/dispatch` — re-validates availability, license, cargo weight; locks vehicle & driver to `On Trip`
- `PATCH /api/trips/:id/complete` — `{ finalOdometerKm, fuelConsumedL, fuelCost, revenue }`; frees vehicle & driver, updates odometer, auto-creates a fuel log
- `PATCH /api/trips/:id/cancel` — restores vehicle & driver if the trip was `Dispatched`

### Maintenance
- `GET /api/maintenance?status=&vehicleId=`
- `POST /api/maintenance` — `{ vehicleId, description, cost, date }` → vehicle becomes `In Shop`
- `PATCH /api/maintenance/:id/close` → vehicle becomes `Available` (unless `Retired`, or another open record remains)

### Fuel & expenses
- `GET/POST /api/fuel-logs` — `{ vehicleId, liters, cost, date }`
- `GET/POST /api/expenses` — `{ vehicleId, category, amount, date, notes }`
- `DELETE /api/fuel-logs/:id`, `DELETE /api/expenses/:id`

### Dashboard & reports
- `GET /api/dashboard?type=&status=&region=` — KPI counts (active/available/in-maintenance vehicles, active/pending trips, drivers on duty, fleet utilization %)
- `GET /api/reports` — per-vehicle fuel efficiency, operational cost, ROI, plus fleet utilization
- `GET /api/reports/export.csv` — same report as a CSV download

## Business rules enforced

- Vehicle registration numbers are unique (case-insensitive).
- `Retired` and `In Shop` vehicles never appear as dispatchable — enforced server-side on both create and dispatch, not just in the UI.
- Suspended drivers or expired licenses are rejected at trip creation and again at dispatch.
- A vehicle or driver already `On Trip` cannot be double-booked.
- Cargo weight is checked against `maxLoadKg` at creation and dispatch.
- Dispatch → both vehicle and driver flip to `On Trip`. Complete → both flip back to `Available`, odometer updates, a fuel log is recorded. Cancel → restores `Available` if the trip had been dispatched.
- Opening a maintenance record forces the vehicle to `In Shop`; closing it restores `Available` unless the vehicle is `Retired` or another open maintenance record still exists on it.

## What's stubbed vs. full production

Given the 5-hour scope, a few things are intentionally simple and are the first
things to swap out for a real deployment:
- **Storage**: `lowdb` writes to a single `data/db.json` file — fine for a demo, not for concurrent production writes. Swap `src/config/db.js` for a real Postgres/Mongo client; every route calls `db.get('collection')...` so the surface area to change is small and centralized.
- **`/api/auth/register`** is open — lock it behind an admin role or remove it once you have a real user-provisioning flow.
- **Revenue** on trips is a manual optional field (used for ROI) — wire it to actual invoicing data if available.
- **Not implemented** (bonus items, out of the 5-hour scope): PDF export, email reminders for expiring licenses, vehicle document uploads.
