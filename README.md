# FERROVIA

FERROVIA is a full-stack railway e-ticketing and operations system. It combines passenger booking, segment-aware seat reservation, ticket management, operator station updates, database-derived live train status, spare trainset rotation, notifications, and an admin workspace in one project.

## Living railway interface

The client now has a daylight/night railway environment built with SVG and CSS: arrival transitions into ambient travel, clouds and stars follow the theme, and occasional distant trains move across the scenery. Fine-pointer parallax is subtle. Offscreen/hidden-tab pausing and a fully static reduced-motion mode are built in.

Run `npm run dev:memory`, then open `http://localhost:5173/?intro=0` to skip the cinematic intro or `?intro=1` to replay it. Deep links use hashes such as `/#/tickets`, `/#/track` and `/#/admin/cancellations`. Direct entry to a booking step returns to search because seat holds and booking selections require an active flow.

UI code lives in `client/src/pages`, shared controls in `components/ui`, railway artwork in `components/brand`, and service-form sections in `components/admin`. Semantic tokens and layout styles live in `src/styles`; `atmosphere.css` supplies theme-aware surfaces and ambient shell motion. The self-hosted font dependency is `@fontsource-variable/manrope`. See [the design system](client/DESIGN_SYSTEM.md) for component usage and motion rules.

The root development dependency `@axe-core/playwright` supports accessibility audits. Run `npm run test:design`, `npm run test:booking-design` and `npm run test:motion` against the local memory server; reports, screenshots and printable PDFs are written to `artifacts/`. These are local QA artifacts, not deployed assets. `CHROME_PATH` can select a browser; otherwise scripts look for bundled Chromium and then installed Chrome/Edge. `client/dist` remains compatible with the repository's existing tracked-build workflow; `.gitignore` already excludes new generated build files.

## Project Status

Last verified: **29 September 2026**.

The passenger, operator, and admin workflows are implemented. The automated backend suite currently contains **12 passing integration tests** in isolated memory mode. A separate rollback-safe PostgreSQL suite verifies the required function, procedure, and trigger against the configured PostgreSQL/Supabase database.

### Verified Feature Matrix

| Area | Available | Current implementation |
| --- | --- | --- |
| Authentication | Yes | Passenger and operator registration, all-role login, signed bearer token, role middleware, operator approval |
| Passenger booking | Yes | Search, class/fare display, segment-aware seats, 10-minute hold, passenger details, confirmation, ticket wallet, print |
| Payment | Demo workflow | Records a successful project payment transaction; no external payment gateway is connected |
| Cancellation/refund | Yes | Passenger request, refund-policy calculation, admin approve/reject, refund records and notifications |
| Live tracking | Yes | Operator Arrived/Departed events; no GPS integration |
| Train operations | Yes | Dated trips, fixed timetable, delay calculation, operator/trainset assignment, automatic unassigned-trip cancellation |
| Spare rotation | Yes | Delay-threshold-based trainset reservation and terminal rotation |
| Admin train management | Yes | Create and edit train services, routes, stops, days, fares, coaches, seats, and trainsets |
| Notifications | Yes | Database-backed list, mark one read, and mark all read |
| Conduttore assistant | Yes | Direct FERROVIA database answers for route, schedule, off-day, fare, seat, recommendation, and live-status questions |
| Theme and responsive UI | Yes | Persistent light/dark theme and responsive passenger, operator, admin, and assistant views |
| Support form delivery | UI only | The FAQ works, but contact-form messages are not persisted or sent |

## Technology Stack

- Frontend: React 19 + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Local database: embedded PostgreSQL-compatible in-memory mode
- Authentication: scrypt password hashing and custom HMAC-SHA256 bearer tokens
- Styling: custom responsive CSS
- Runtime ports:
  - Frontend: `http://localhost:5173`
  - Backend API: `http://localhost:5000`

## Main Features

- Passenger registration and login
- Role-based access for passengers, operators, and admins
- Station search with database-backed dropdowns
- Route/date-based train search
- Automatic UP/DOWN direction handling from route data
- Class availability and backend fare calculation
- Segment-aware seat availability
- 10-minute held seat reservations
- Payment confirmation
- Ticket generation after payment
- Passenger dashboard with journey summary
- My Tickets page with booking details and print support
- Booking cancellation with refund request records
- Database-backed user notifications
- Train tracking by train code or trip ID
- Operator Arrived/Departed workflow
- Live last-station-left and delay display
- Fixed public timetable with actual operational timestamps
- Automatic 60-minute spare trainset reservation and rotation
- Admin route, trainset, operator, train service, and schedule workspace
- Admin train service creation with routes, stops, fares, coaches, seats, running days, and trainsets
- Admin train and route editing
- Automatic trip issuing for the next seven operating days
- Admin operator assignment for generated trips
- Operator self-registration with admin approval
- Passenger cancellation request review and refund policy
- Database-backed Conduttore assistant with English, Banglish, and supported Bangla phrasing
- Persistent light and dark themes across the application
- Support/FAQ screen for booking, tracking, spare rotation, and refunds

## Core Railway Model

- `TRAINS`: public train service, for example Suborno Express
- `TRAINSETS`: physical train rakes, for example SUB-01, SUB-02, SUB-03
- `ROUTES`: direction-specific UP/DOWN route templates
- `ROUTE_STOPS`: fixed public timetable stops for a route
- `TRAIN_RUNNING_DAYS`: days and departure minutes for generated service schedules
- `TRIPS`: one dated journey of a route
- `TRIP_STOPS`: scheduled and actual station events for a trip
- `COACHES` and `SEATS`: physical seat layout by class
- `TRIP_SEATS`: dated seat inventory for each trip
- `SEAT_RESERVATIONS`: segment-wise holds and confirmed reservations
- `BOOKINGS`, `PASSENGERS`, `TICKETS`, `PAYMENTS`, `REFUNDS`: full ticketing lifecycle
- `TRAINSET_ASSIGNMENTS`: normal, spare replacement, and manual trainset assignments
- `NOTIFICATIONS`: user-facing booking and operational notifications

## DBMS Implementation Evidence

The project uses PostgreSQL features as part of the running application, not only as standalone SQL examples.

| DBMS requirement | Object or code | Runtime use |
| --- | --- | --- |
| Tables and relationships | `database/schema.sql` | 23 public tables with primary keys, foreign keys, unique constraints, checks, and indexes |
| Complex queries | `server/src/repositories/` | Multi-table search, segment availability, booking details, live status, refunds, and trainset operations |
| Views | `VW_LIVE_TRAIN_STATUS`, `VW_TRAINSET_STATUS` | Live journey state and current physical trainset state |
| Computed function | `calculate_ticket_fare(...)` | PostgreSQL booking and availability paths calculate segment fare inside the database |
| Multi-table procedure | `cancel_booking_workflow(...)` | PostgreSQL maintenance cancels bookings, releases reservations, cancels tickets, and creates refund requests for unassigned departed trips |
| Trigger | `TRG_NO_OVERLAPPING_RESERVATION` | Rejects overlapping active reservations for the same dated seat and locks the seat row for concurrency |
| Explicit transaction | `withTransaction(...)` in `server/src/config/database.js` | Executes `BEGIN`, commits successful booking/payment/admin/operator workflows, and rolls back failures |
| Row locking | `SELECT ... FOR UPDATE` | Protects booking, seat, trip, cancellation, and trainset mutations from concurrent updates |
| Role authorization | `requireAuth` and `requireRole` | Protects passenger, operator, and admin endpoints at API level |

The PostgreSQL objects are defined in both the canonical fresh schema and the reusable installation script:

- `database/schema.sql`: complete fresh database definition
- `database/required_db_features.sql`: idempotent function/procedure/trigger installation for an existing database

Memory mode provides JavaScript equivalents where `pg-mem` cannot execute the PostgreSQL procedure and trigger. PostgreSQL mode deliberately calls the real database function and procedure; it does not silently fall back if those objects are missing.

Use these read-only catalog queries in the Supabase SQL Editor to confirm the DBMS objects before a demonstration:

```sql
SELECT proname, prokind
FROM pg_proc
WHERE proname IN (
  'calculate_ticket_fare',
  'cancel_booking_workflow',
  'validate_no_overlapping_reservation'
)
ORDER BY proname;

SELECT tgname
FROM pg_trigger
WHERE tgname = 'trg_no_overlapping_reservation'
  AND NOT tgisinternal;

SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('vw_live_train_status', 'vw_trainset_status')
ORDER BY table_name;
```

Expected `prokind` values are `f` for the two functions and `p` for the procedure.

## Live Train Tracking

FERROVIA uses operator station events instead of GPS. An assigned operator opens the Operator Console and marks each stop as Arrived or Departed. The backend stores the actual timestamp and computes live status from the trip schedule.

The passenger tracking page shows:

- current train status
- last station left
- actual departure time
- current delay at the last departed station
- next station
- original scheduled time
- spare-trigger state
- full stop timeline

The public timetable remains fixed. Delays are shown as operational status and do not shift the published route schedule.

## Spare Trainset Rotation

Each train service has a delay threshold stored in `TRAINS.SPARE_TRIGGER_DELAY_MIN`. The default service uses a 60-minute threshold.

When a delayed departure reaches the threshold:

1. The current trainset continues and completes its current journey.
2. A spare trainset at the destination terminal is reserved for the next opposite-direction trip.
3. The delayed trainset becomes spare after it reaches the destination.
4. The reserved spare trainset becomes active when the next opposite-direction trip departs.
5. If the threshold is never reached, the normal trainset is reserved for the next opposite trip.

The recommended fleet for a two-terminal service is one operating trainset and one spare trainset at each terminal.

## Database Setup

For a fresh PostgreSQL database, run the schema and seed in this order:

```bash
psql "$PG_CONNECTION_STRING" -v ON_ERROR_STOP=1 \
  -f database/schema.sql \
  -f database/seed-local.sql \
  -f database/required_db_features.sql
```

`schema.sql` already contains the PostgreSQL fare function, cancellation procedure, and seat-overlap trigger. Running `required_db_features.sql` afterward safely recreates those three objects and is also the intended installer for an existing Supabase/PostgreSQL database. It does not drop project tables or delete application data.

For an existing database, first apply any missing files from `database/sql_history/`, then run:

```bash
psql "$PG_CONNECTION_STRING" -v ON_ERROR_STOP=1 \
  -f database/required_db_features.sql
```

The in-memory application mode does not install or execute these PostgreSQL-only objects.

Additional data and maintenance scripts are also included:

- `database/seed_trains.sql`: legacy generated Bangladesh Railway train and route data. Do not apply it until all stop distances are verified. The checked-in workbook lacks `Distance_From_Source_KM`; `server/generate_sql.js` refuses to generate a replacement without that source column.
- `database/seed_running_days.sql`: running-day schedule data
- `database/trip.sql`: fare, class, seat inventory, and trip helper data
- `database/sql_history/`: database change history

The seed data creates:

- Suborno Express UP and DOWN route templates
- Dhaka, Chattogram, Cumilla, Feni, and other stations
- class types, fare rules, coaches, seats, trips, and trip seats
- three physical trainsets for spare rotation
- operator and admin accounts

## Seed Accounts

The following credentials are created only by a fresh `database/seed-local.sql` load and by memory mode. They are not guaranteed to match an already-hosted Supabase database, where passwords may have been changed.

```text
Operator: operator@ferrovia.local / Operator123!
Admin:    admin@ferrovia.local    / Admin123!
```

Passengers can create accounts from the website.

Operators can also register, but remain `PENDING` and cannot sign in until an admin approves them. Public registration cannot create an admin account.

## Environment

For a zero-setup local run, create `server/.env` with:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_MODE=memory

JWT_SECRET=replace_with_a_long_random_secret
AUTH_TOKEN_TTL_SECONDS=604800
```

The in-memory mode loads a PostgreSQL-compatible schema and complete local dataset at server startup. Data resets when the backend restarts.

For persistent PostgreSQL, use:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_MODE=postgres

PG_CONNECTION_STRING=postgresql://user:password@host:5432/database
PG_POOL_MIN=1
PG_POOL_MAX=10

JWT_SECRET=replace_with_a_long_random_secret
AUTH_TOKEN_TTL_SECONDS=604800
```

The frontend uses Vite's proxy for local development, so browser requests to `/api` are forwarded to `http://localhost:5000`.

Conduttore does not require a Gemini or OpenAI key. It answers from project data through `/api/chat`.

## Installation

Install dependencies for the root runner, backend, and frontend:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

## Run The Full App

From the project root:

```bash
npm run dev
```

This starts both processes:

- Express API on `http://localhost:5000`
- Vite frontend on `http://localhost:5173`

`npm run dev` explicitly uses the configured PostgreSQL/Supabase database. For the isolated in-memory database instead, run `npm run dev:memory`.

Health check:

```text
GET http://localhost:5000/api/health
```

## Run Separately

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Passenger Workflow

1. Search by departure station, arrival station, date, and passenger count.
2. Select an available trip and class.
3. Choose segment-available seats.
4. Enter passenger details.
5. Sign in or register.
6. Create a 10-minute seat hold.
7. Confirm the demo payment transaction.
8. Receive confirmed booking, tickets, and notification.
9. View or print tickets from My Tickets.
10. Submit a cancellation request for admin review when eligible.

## Operator Workflow

1. Register as an operator and wait for admin approval, or sign in with an approved operator account.
2. Open the Operator Console.
3. Select the assigned trip for the operating date.
4. Mark each stop as Arrived and Departed.
5. Let the backend calculate delay, trip progress, completion, and spare rotation.

## Admin Workflow

1. Sign in with the admin account.
2. View fleet and trainset status.
3. Create complete train services with routes, stops, running days, fares, coaches, seats, and trainsets.
4. Edit train and route information.
5. Review automatically issued trips for the next seven operating days.
6. Approve pending operator accounts.
7. Assign operators and trainsets to trips before departure.
8. Approve or reject passenger cancellation requests.
9. Monitor trip status, delay, refunds, and fleet position.

## API Overview

Public:

```text
GET /api/health
GET /api/stations
GET /api/trains
GET /api/trains/search?from=Dhaka&to=Chattogram&date=YYYY-MM-DD
GET /api/trains/:trainCode/status
GET /api/trips/:tripId/status
GET /api/trips/:tripId/stops
GET /api/bookings/classes?tripId=...&sourceStationId=...&destinationStationId=...
GET /api/bookings/seats?tripId=...&sourceStationId=...&destinationStationId=...&classId=...
POST /api/chat
```

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

`register` accepts only `PASSENGER` or `OPERATOR`; operator accounts require admin approval.

Bookings:

```text
POST /api/bookings
GET  /api/bookings/mine
GET  /api/bookings/:pnr
POST /api/bookings/:pnr/pay
POST /api/bookings/:pnr/cancel
```

Notifications:

```text
GET   /api/notifications
PATCH /api/notifications/read-all
PATCH /api/notifications/:notificationId/read
```

Operator:

```text
GET  /api/operator/trips?date=YYYY-MM-DD
GET  /api/operator/trips/:tripId
POST /api/operator/trips/:tripId/stops/:tripStopId/arrive
POST /api/operator/trips/:tripId/stops/:tripStopId/depart
```

Admin:

```text
GET   /api/admin/routes
PATCH /api/admin/routes/:routeId
GET   /api/admin/operators
GET   /api/admin/operators/pending
PATCH /api/admin/operators/:userId/approve
GET   /api/admin/trips?date=YYYY-MM-DD
PATCH /api/admin/trips/:tripId/operator
PATCH /api/admin/trips/:tripId/trainset
GET   /api/admin/trainsets?trainId=...
GET   /api/admin/cancellation-requests
PATCH /api/admin/cancellation-requests/:requestId
GET   /api/admin/train-services
GET   /api/admin/train-services/:trainId
PATCH /api/admin/train-services/:trainId
GET   /api/admin/train-form-options
POST  /api/admin/train-services
```

Authenticated requests use:

```text
Authorization: Bearer <token>
```

## Current Boundaries

- Payment confirmation is an internal academic-project simulation; no bank, card processor, or mobile-financial-service gateway is connected.
- Live position is derived from operator Arrived/Departed events, not GPS hardware.
- Conduttore is a database-backed railway assistant, not a general-purpose LLM. It intentionally answers only supported FERROVIA questions.
- The support contact form currently shows a successful UI message but does not save or send the submission.
- Logout clears the browser session. Issued stateless bearer tokens remain valid until their configured expiry because there is no server-side revocation list.
- Passenger and operator registration are public; admin accounts must be seeded or created directly through controlled database administration.
- The default integration suite runs in isolated memory mode. Run `npm run test:postgres` explicitly to verify PostgreSQL-specific behavior against the configured database; its temporary fixture is always rolled back.

## Project Structure

```text
Railway_us/
|-- client/                 React + Vite frontend
|   |-- src/App.jsx         Main app screens and workflows
|   |-- src/components/     Navbar, search, assistant, date picker, admin forms, icons
|   |-- src/lib/api.js      API client and session helpers
|   `-- vite.config.js      Vite dev server and /api proxy
|-- server/                 Express backend
|   |-- src/app.js          API app and route registration
|   |-- src/index.js        Server startup and shutdown
|   |-- src/routes/         Auth, train, trip, booking, operator, admin routes
|   |-- src/controllers/    Request handlers
|   |-- src/services/       Business rules and transactions
|   |-- src/repositories/   SQL access layer
|   |-- src/middleware/     Auth and error middleware
|   `-- src/utils/          Auth, serialization, time, and HTTP helpers
|-- database/               Schema, seeds, migrations, function, procedure, and trigger SQL
|   |-- schema.sql          Canonical fresh PostgreSQL schema
|   `-- required_db_features.sql  Existing-database DBMS object installer
|-- scripts/dev.cjs         Runs backend and frontend together
|-- package.json            Root development runner
`-- README.md               Final project documentation
```

## Verification Commands

Run the complete verification suite:

```bash
npm run check
```

This runs frontend lint, all backend integration tests, and the frontend production build.

Current expected backend result: `12` tests passed, `0` failed.

PostgreSQL/Supabase function, procedure, and trigger regression test:

```bash
npm run test:postgres
```

This test requires `server/.env` to contain `PG_CONNECTION_STRING`. It creates a temporary valid booking inside an explicit transaction, verifies fare calculation, overlapping-seat rejection, and the cancellation workflow, then executes `ROLLBACK` in all cases.

With the API and client development servers running, verify the complete booking, payment, ticket, admin, and mobile navigation flows in a real browser:

```bash
npm run test:ui
```

The complete browser suite creates test records and therefore runs only in embedded memory mode by default. When connected to PostgreSQL or Supabase, use the read-only train suggestion check:

```bash
npm run test:ui:track
```

Backend integration tests:

```bash
npm --prefix server test
```

Backend syntax check:

```bash
npm --prefix server run check
```

Frontend production build:

```bash
npm --prefix client run build
```

Frontend lint:

```bash
npm --prefix client run lint
```
