import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DataType, newDb } from 'pg-mem'

const currentDir = dirname(fileURLToPath(import.meta.url))
const databaseDir = resolve(currentDir, '../../../database')

const memoryViews = `
CREATE VIEW VW_LIVE_TRAIN_STATUS AS
SELECT
  T.TRIP_ID,
  TR.TRAIN_ID,
  TR.TRAIN_NAME,
  TR.TRAIN_CODE,
  R.ROUTE_ID,
  R.ROUTE_CODE,
  R.DIRECTION,
  T.JOURNEY_DATE,
  T.TRIP_STATUS,
  T.SCHEDULED_DEPARTURE,
  T.SCHEDULED_ARRIVAL,
  T.ACTUAL_DEPARTURE,
  T.ACTUAL_ARRIVAL,
  CAST(NULL AS INT) AS LAST_LEFT_STATION_ID,
  CAST(NULL AS VARCHAR(100)) AS LAST_LEFT_STATION,
  CAST(NULL AS TIMESTAMP) AS LAST_LEFT_AT,
  CAST(NULL AS TIMESTAMP) AS LAST_SCHEDULED_DEPARTURE,
  0 AS CURRENT_DELAY_MINUTES,
  CAST(NULL AS INT) AS NEXT_STATION_ID,
  CAST(NULL AS VARCHAR(100)) AS NEXT_STATION,
  CAST(NULL AS TIMESTAMP) AS NEXT_SCHEDULED_ARRIVAL,
  CAST(NULL AS TIMESTAMP) AS NEXT_SCHEDULED_DEPARTURE,
  CASE WHEN T.SPARE_TRIGGERED_AT IS NULL THEN 0 ELSE 1 END AS SPARE_TRIGGERED
FROM TRIPS T
JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID;

CREATE VIEW VW_TRAINSET_STATUS AS
SELECT
  TS.TRAINSET_ID,
  TS.TRAINSET_CODE,
  TS.TRAIN_ID,
  T.TRAIN_NAME,
  TS.STATUS,
  TS.CURRENT_STATION_ID,
  S.STATION_NAME AS CURRENT_STATION,
  TS.STATUS_UPDATED_AT
FROM TRAINSETS TS
JOIN TRAINS T ON T.TRAIN_ID = TS.TRAIN_ID
LEFT JOIN STATIONS S ON S.STATION_ID = TS.CURRENT_STATION_ID;
`

function readSql(name) {
  return readFileSync(resolve(databaseDir, name), 'utf8')
}

function memorySchema() {
  const schema = readSql('schema.sql')
  const marker = '-- VIEW 1: LIVE TRAIN STATUS'
  const markerIndex = schema.indexOf(marker)
  if (markerIndex < 0) throw new Error('Could not locate database view definitions')

  const dividerIndex = schema.lastIndexOf('-- ============================================================', markerIndex)
  return `${schema.slice(0, dividerIndex)}\n${memoryViews}`
}

function memorySeed() {
  const days = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI']
  const runningDays = [
    ...days.map(day => `(1, '${day}', 420)`),
    ...days.map(day => `(2, '${day}', 840)`),
  ].join(', ')
  const seats = Array.from({ length: 36 }, (_, index) => {
    const coachId = Math.floor(index / 12) + 1
    const number = (index % 12) + 1
    const type = number % 4 === 0 || number % 4 === 1 ? 'WINDOW' : 'AISLE'
    return `(${coachId}, '${number}', '${type}')`
  }).join(', ')
  const tripSeats = [1, 2]
    .flatMap(tripId => Array.from({ length: 36 }, (_, index) => `(${tripId}, ${index + 1}, 'AVAILABLE')`))
    .join(', ')

  return `
INSERT INTO USERS (FULL_NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE) VALUES
  ('Demo Operator', 'operator@ferrovia.local', '01700000001', 'scrypt$985e8d1c92c46892f79861543c64c3fa$7c28cd4a83a5c1885214897cb8b52e5af96ef1c4f2ea5d9e1fdb37516acffb3c3326eae57f7f56a47b1f07b36ce578cbfe41430d36b7e8581558edab69e2339e', 'OPERATOR'),
  ('Demo Admin', 'admin@ferrovia.local', '01700000002', 'scrypt$490444c8d6acc83010e68d7a15b7fd70$21f5ed937bf7db53181dfc51edb39fecbdce09d572396bc7731af0b4228baa2344bc8969290358e359a3580fb5fc3b9beb978928b3674867a2d99ff3ba9a1e17', 'ADMIN');

INSERT INTO STATIONS (STATION_NAME, CITY, STATION_CODE) VALUES
  ('Dhaka', 'Dhaka', 'DHA'), ('Cumilla', 'Cumilla', 'CML'),
  ('Feni', 'Feni', 'FEN'), ('Chattogram', 'Chattogram', 'CTG'),
  ('Rajshahi', 'Rajshahi', 'RAJ'), ('Khulna', 'Khulna', 'KHL'),
  ('Sylhet', 'Sylhet', 'SYL'), ('Rangpur', 'Rangpur', 'RNG'),
  ('Mymensingh', 'Mymensingh', 'MYM'), ('Brahmanbaria', 'Brahmanbaria', 'BRA'),
  ('Noakhali', 'Noakhali', 'NOA'), ('Jashore', 'Jashore', 'JSR');

INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
VALUES ('Suborno Express', 'INTERCITY', 'SUBORNO', 'ACTIVE', 60);

INSERT INTO ROUTES
  (TRAIN_ID, ROUTE_CODE, TRAIN_NUMBER, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID)
VALUES
  (1, 'SUB-UP', '701', 'UP', 1, 4),
  (1, 'SUB-DOWN', '702', 'DOWN', 4, 1);

INSERT INTO ROUTE_STOPS
  (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM)
VALUES
  (1, 1, 1, NULL, 0, 0), (1, 2, 2, 135, 140, 110),
  (1, 3, 3, 200, 205, 170), (1, 4, 4, 300, NULL, 320),
  (2, 4, 1, NULL, 0, 0), (2, 3, 2, 95, 100, 150),
  (2, 2, 3, 160, 165, 210), (2, 1, 4, 300, NULL, 320);

INSERT INTO TRAIN_RUNNING_DAYS (ROUTE_ID, DAY_CODE, DEPARTURE_MINUTE)
VALUES ${runningDays};

INSERT INTO TRAINSETS (TRAIN_ID, TRAINSET_CODE, STATUS, CURRENT_STATION_ID) VALUES
  (1, 'SUB-01', 'RESERVED', 1),
  (1, 'SUB-02', 'SPARE', 1),
  (1, 'SUB-03', 'SPARE', 4);

INSERT INTO CLASS_TYPES (CLASS_NAME, CLASS_CODE) VALUES
  ('SHOVAN', 'S_CHAIR'), ('SNIGDHA', 'SN'), ('AC SEAT', 'AC_S');

INSERT INTO COACHES (TRAIN_ID, CLASS_ID, COACH_CODE, COACH_ORDER) VALUES
  (1, 1, 'A', 1), (1, 2, 'B', 2), (1, 3, 'C', 3);

INSERT INTO SEATS (COACH_ID, SEAT_NUMBER, SEAT_TYPE) VALUES ${seats};

INSERT INTO FARE_RULES (TRAIN_ID, CLASS_ID, RATE_PER_KM, BASE_FARE) VALUES
  (1, 1, 1.50, 50), (1, 2, 2.50, 100), (1, 3, 3.50, 150);

INSERT INTO TRIPS
  (TRAIN_ID, ROUTE_ID, JOURNEY_DATE, SCHEDULED_DEPARTURE, SCHEDULED_ARRIVAL, TRIP_STATUS, OPERATOR_USER_ID)
VALUES
  (1, 1, CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '400 MINUTE', CURRENT_TIMESTAMP + INTERVAL '305 MINUTE', 'SCHEDULED', 1),
  (1, 2, CURRENT_DATE, CURRENT_TIMESTAMP + INTERVAL '420 MINUTE', CURRENT_TIMESTAMP + INTERVAL '720 MINUTE', 'SCHEDULED', 1);

INSERT INTO TRIP_STOPS
  (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE, SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE)
VALUES
  (1, 1, 1, 1, NULL, CURRENT_TIMESTAMP - INTERVAL '400 MINUTE'),
  (1, 2, 2, 2, CURRENT_TIMESTAMP - INTERVAL '265 MINUTE', CURRENT_TIMESTAMP - INTERVAL '260 MINUTE'),
  (1, 3, 3, 3, CURRENT_TIMESTAMP - INTERVAL '200 MINUTE', CURRENT_TIMESTAMP - INTERVAL '195 MINUTE'),
  (1, 4, 4, 4, CURRENT_TIMESTAMP - INTERVAL '100 MINUTE', NULL),
  (2, 5, 4, 1, NULL, CURRENT_TIMESTAMP + INTERVAL '420 MINUTE'),
  (2, 6, 3, 2, CURRENT_TIMESTAMP + INTERVAL '515 MINUTE', CURRENT_TIMESTAMP + INTERVAL '520 MINUTE'),
  (2, 7, 2, 3, CURRENT_TIMESTAMP + INTERVAL '580 MINUTE', CURRENT_TIMESTAMP + INTERVAL '585 MINUTE'),
  (2, 8, 1, 4, CURRENT_TIMESTAMP + INTERVAL '720 MINUTE', NULL);

INSERT INTO TRAINSET_ASSIGNMENTS
  (TRIP_ID, TRAINSET_ID, TRAIN_ID, ASSIGNMENT_TYPE, ASSIGNMENT_STATUS, REASON)
VALUES (1, 1, 1, 'NORMAL', 'RESERVED', 'Initial demo assignment');

INSERT INTO TRIP_SEATS (TRIP_ID, SEAT_ID, SEAT_STATUS) VALUES ${tripSeats};
`
}

export function createMemoryPool() {
  const database = newDb({
    autoCreateForeignKeyIndices: true,
    noAstCoverageCheck: true,
  })
  for (const type of [DataType.date, DataType.timestamp, DataType.timestamptz]) {
    database.public.registerFunction({
      name: 'date',
      args: [type],
      returns: DataType.date,
      implementation: value => new Date(Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate()
      )),
    })
  }
  database.public.registerFunction({
    name: 'trim',
    args: [DataType.text],
    returns: DataType.text,
    implementation: value => String(value).trim(),
  })
  database.public.registerOperator({
    operator: '*',
    left: DataType.integer,
    right: DataType.interval,
    returns: DataType.interval,
    implementation: (factor, interval) => Object.fromEntries(
      Object.entries(interval).map(([key, value]) => [key, Number(value) * factor])
    ),
  })
  for (const type of [DataType.timestamp, DataType.timestamptz]) {
    database.public.registerOperator({
      operator: '-',
      left: type,
      right: type,
      returns: DataType.interval,
      implementation: (left, right) => ({ seconds: (left.getTime() - right.getTime()) / 1000 }),
    })
  }
  database.public.none(memorySchema())
  database.public.none(memorySeed())

  const { Pool } = database.adapters.createPg()
  return new Pool()
}
