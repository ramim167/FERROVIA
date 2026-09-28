# FERROVIA PostgreSQL Database

Run on a fresh PostgreSQL database in this order:

1. `schema.sql`
2. `seed-local.sql`
3. `required_db_features.sql`

For example, from the repository root:

```bash
psql "$PG_CONNECTION_STRING" -v ON_ERROR_STOP=1 -f database/schema.sql -f database/seed-local.sql -f database/required_db_features.sql
```

`required_db_features.sql` installs the `calculate_ticket_fare` function, the
`cancel_booking_workflow` procedure, and the overlapping-seat-reservation
trigger. These PostgreSQL objects are not loaded by the in-memory application
mode.

The schema contains the complete railway data model plus:

- `VW_LIVE_TRAIN_STATUS`
- `VW_TRAINSET_STATUS`

Core operational tables include `ROUTES`, `ROUTE_STOPS`, `TRAINSETS`, `TRAINSET_ASSIGNMENTS`, `TRIPS`, `TRIP_STOPS`, `COACHES`, `SEATS`, `TRIP_SEATS`, and `SEAT_RESERVATIONS`.

`ROUTE_STOPS` stores the fixed public timetable. `TRIP_STOPS` stores scheduled and actual events for each dated trip. `VW_LIVE_TRAIN_STATUS` derives the last station left, current delay, next station, and spare-trigger state.

The seed data creates Suborno Express in both directions, twelve stations, three travel classes, fares, coaches and seats, two dated trips, three physical trainsets, and operator/admin accounts.

Additional scripts:

- `seed_trains.sql`: legacy expanded route data. Do not apply until stop distances are verified; the accompanying workbook has no distance column.
- `seed_running_days.sql`: running-day definitions
- `trip.sql`: trip and fare helper data
- `sql_history/`: applied schema corrections and history
