# FERROVIA / Railway Nexus

FERROVIA is a complete full-stack railway e-ticketing and operational tracking system. It combines passenger booking, segment-aware seat reservation, demo payment, ticket management, operator station updates, live train status, spare trainset rotation, notifications, and an admin operations workspace in one project.

## Project Status

The project is complete and ready for local demonstration. The frontend, backend API, database schema, seed data, passenger flow, operator console, admin controls, live tracking model, booking lifecycle, and trainset rotation logic are implemented.

## Technology Stack

- Frontend: React 19 + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: custom bearer token flow
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
- Demo payment confirmation
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
- Admin route, trainset, trip, operator, train service, and schedule workspace
- Admin train service creation with routes, stops, fares, coaches, seats, running days, and trainsets
- Admin train and route editing
- Admin trip creation and operator assignment
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

Each train service has a delay threshold stored in `TRAINS.SPARE_TRIGGER_DELAY_MIN`. The demo service uses a 60-minute threshold.

When a delayed departure reaches the threshold:

1. The current trainset continues and completes its current journey.
2. A spare trainset at the destination terminal is reserved for the next opposite-direction trip.
3. The delayed trainset becomes spare after it reaches the destination.
4. The reserved spare trainset becomes active when the next opposite-direction trip departs.
5. If the threshold is never reached, the normal trainset is reserved for the next opposite trip.

The recommended demo fleet for a two-terminal service is one operating trainset and one spare trainset at each terminal.

## Database Setup

Run these files on a fresh PostgreSQL database:

```sql
database/schema.sql
database/seed-demo.sql
```

Optional data and maintenance scripts are also included:

- `database/seed_trains.sql`: generated Bangladesh Railway train and route data
- `database/seed_running_days.sql`: running-day schedule data
- `database/trip.sql`: fare, class, seat inventory, and trip helper data
- `database/sql_history/`: database change history
- `database/schema-current.sql`: Oracle reference version of the schema

The demo seed creates:

- Suborno Express UP and DOWN route templates
- Dhaka, Chattogram, Cumilla, Feni, and other stations
- class types, fare rules, coaches, seats, trips, and trip seats
- three physical trainsets for spare rotation
- operator and admin demo accounts

## Demo Accounts

```text
Operator: operator@ferrovia.local / Operator123!
Admin:    admin@ferrovia.local    / Admin123!
```

Passengers can create accounts from the website.

## Environment

Create `server/.env` with the local server, client, database, and auth settings:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

PG_CONNECTION_STRING=postgresql://user:password@host:5432/database
PG_POOL_MIN=1
PG_POOL_MAX=10

JWT_SECRET=replace_with_a_long_random_secret
AUTH_TOKEN_TTL_SECONDS=604800
```

The frontend uses Vite's proxy for local development, so browser requests to `/api` are forwarded to `http://localhost:5000`.

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
7. Complete demo payment.
8. Receive confirmed booking, tickets, and notification.
9. View, print, or cancel tickets from My Tickets.

## Operator Workflow

1. Sign in with the operator account.
2. Open the Operator Console.
3. Select the assigned trip for the operating date.
4. Mark each stop as Arrived and Departed.
5. Let the backend calculate delay, trip progress, completion, and spare rotation.

## Admin Workflow

1. Sign in with the admin account.
2. View fleet and trainset status.
3. Create complete train services with routes, stops, running days, fares, coaches, seats, and trainsets.
4. Edit train and route information.
5. Create dated trips from route templates.
6. Assign operators to trips.
7. Monitor trips, train status, delay, and fleet position.

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
```

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

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
GET   /api/admin/trips?date=YYYY-MM-DD
POST  /api/admin/trips
PATCH /api/admin/trips/:tripId/operator
GET   /api/admin/trainsets?trainId=...
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

## Project Structure

```text
Railway_us/
|-- client/                 React + Vite frontend
|   |-- src/App.jsx         Main app screens and workflows
|   |-- src/components/     Navbar, search, date picker, admin forms, icons
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
|-- database/               Schema, seed data, and SQL history
|-- scripts/dev.cjs         Runs backend and frontend together
|-- package.json            Root development runner
`-- README.md               Final project documentation
```

## Verification Commands

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
