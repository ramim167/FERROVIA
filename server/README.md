# FERROVIA Backend

Express and PostgreSQL API for passenger booking, ticketing, notifications, live railway operations, trainset rotation, and administration.

## Environment

Zero-setup local run:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_MODE=memory
JWT_SECRET=replace_with_a_long_random_secret
AUTH_TOKEN_TTL_SECONDS=604800
```

Persistent PostgreSQL:

```env
DATABASE_MODE=postgres
PG_CONNECTION_STRING=postgresql://user:password@localhost:5432/ferrovia
PG_POOL_MIN=1
PG_POOL_MAX=10
```

## Architecture

```text
routes -> controllers -> services -> repositories -> PostgreSQL
```

Business rules and transactions live in services. Parameterized SQL lives in repositories. Public registration always creates a passenger account; operator and admin access use provisioned role accounts.

## Commands

```bash
npm install
npm run dev
npm test
npm run check
```

`npm test` covers health, authentication, train search, fares, seat availability, booking, payment, cancellation/refunds, notifications, tracking, operator station progression, spare rotation, automatic trip issuing, and admin operator assignment.

## API Groups

- Public: `/api/health`, `/api/stations`, `/api/trains`, `/api/trips`, booking classes and seats
- Authentication: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Passenger: `/api/bookings`, `/api/notifications`
- Operator: `/api/operator/trips`
- Admin: `/api/admin/routes`, `/api/admin/operators`, `/api/admin/trips`, `/api/admin/trainsets`, `/api/admin/train-services`

Authenticated requests use `Authorization: Bearer <token>`.

Operator event timestamps come from PostgreSQL `CURRENT_TIMESTAMP`. Departures calculate delay against the fixed timetable, reserve a destination spare after the configured threshold, and update trainset rotation when the trip reaches its destination.
