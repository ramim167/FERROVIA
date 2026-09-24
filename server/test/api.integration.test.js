import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

process.env.DATABASE_MODE = 'memory'
process.env.JWT_SECRET = 'ferrovia-integration-test-secret'
process.env.NODE_ENV = 'test'

let baseUrl
let closeDatabase
let server
let passengerToken
let operatorToken
let adminToken
let searchedTrip
let selectedClass
let selectedSeat
let bookingPnr

async function request(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${payload.error}${payload.debug ? ` - ${payload.debug}` : ''}`)
  }

  return payload.data ?? payload
}

async function requestRaw(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  return {
    status: response.status,
    payload: await response.json(),
  }
}

function today() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Dhaka' })
}

before(async () => {
  const [{ createApp }, database] = await Promise.all([
    import('../src/app.js'),
    import('../src/config/database.js'),
  ])
  closeDatabase = database.closeDatabase
  await database.initializeDatabase()

  await new Promise(resolve => {
    server = createApp().listen(0, '127.0.0.1', () => {
      const address = server.address()
      baseUrl = `http://127.0.0.1:${address.port}/api`
      resolve()
    })
  })
})

after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  await closeDatabase()
})

test('health, stations and train services are available', async () => {
  const health = await request('/health')
  assert.equal(health.databaseMode, 'memory')

  const stations = await request('/stations')
  const trains = await request('/trains')
  assert.equal(stations.length, 12)
  assert.equal(trains.length, 1)
  assert.equal(trains[0].train_code, 'SUBORNO')
})

test('300 km reference fares match Shovan, Snigdha and AC Berth policy', async () => {
  const { fareForSegment } = await import('../src/services/booking.service.js')
  const segment = { SOURCE_DISTANCE_KM: 0, DEST_DISTANCE_KM: 300 }

  assert.equal(fareForSegment(segment, { BASE_FARE: 0, RATE_PER_KM: 1.666667 }), 500)
  assert.equal(fareForSegment(segment, { BASE_FARE: 0, RATE_PER_KM: 3.666667 }), 1100)
  assert.equal(fareForSegment(segment, { BASE_FARE: 0, RATE_PER_KM: 6 }), 1800)
  assert.equal(
    fareForSegment(
      { SOURCE_DISTANCE_KM: 0, DEST_DISTANCE_KM: 1 },
      { BASE_FARE: 0, RATE_PER_KM: 1933.33 }
    ),
    1940
  )
})

test('public registration always creates a passenger account', async () => {
  const session = await request('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Integration Passenger',
      email: 'passenger.test@ferrovia.local',
      phone: '01700000009',
      password: 'Passenger123!',
      role: 'ADMIN',
    },
  })

  assert.equal(session.user.role, 'PASSENGER')
  passengerToken = session.token
  const me = await request('/auth/me', { token: passengerToken })
  assert.equal(me.email, 'passenger.test@ferrovia.local')
})

test('seeded operator and admin accounts authenticate', async () => {
  const operator = await request('/auth/login', {
    method: 'POST',
    body: { email: 'operator@ferrovia.local', password: 'Operator123!' },
  })
  const admin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@ferrovia.local', password: 'Admin123!' },
  })

  assert.equal(operator.user.role, 'OPERATOR')
  assert.equal(admin.user.role, 'ADMIN')
  operatorToken = operator.token
  adminToken = admin.token
})

test('passenger can search, reserve, pay, view and cancel a ticket', async () => {
  const trips = await request(`/trains/search?from=Dhaka&to=Chattogram&date=${today()}`)
  assert.ok(trips.length > 0)
  searchedTrip = trips[0]

  const segment = `tripId=${searchedTrip.trip_id}&sourceStationId=${searchedTrip.source_station_id}&destinationStationId=${searchedTrip.destination_station_id}`
  const classes = await request(`/bookings/classes?${segment}`)
  assert.ok(classes.length > 0)
  assert.deepEqual(classes.map(item => item.classCode), ['S_CHAIR', 'SN', 'AC_B'])
  selectedClass = classes[0]

  const seatData = await request(`/bookings/seats?${segment}&classId=${selectedClass.classId}`)
  selectedSeat = seatData.seats.find(seat => Number(seat.is_available) === 1)
  assert.ok(selectedSeat)

  const booking = await request('/bookings', {
    method: 'POST',
    token: passengerToken,
    body: {
      tripId: searchedTrip.trip_id,
      sourceStationId: searchedTrip.source_station_id,
      destinationStationId: searchedTrip.destination_station_id,
      classId: selectedClass.classId,
      passengers: [{
        name: 'Integration Passenger',
        age: 27,
        gender: 'OTHER',
        tripSeatId: selectedSeat.trip_seat_id,
      }],
    },
  })
  bookingPnr = booking.pnr_number
  assert.equal(booking.booking_status, 'PENDING')

  const paid = await request(`/bookings/${bookingPnr}/pay`, {
    method: 'POST',
    token: passengerToken,
    body: { method: 'MOBILE_BANKING', transactionId: 'INTEGRATION-001' },
  })
  assert.equal(paid.booking_status, 'CONFIRMED')
  assert.ok(paid.passengers[0].ticket_id)

  const mine = await request('/bookings/mine', { token: passengerToken })
  assert.ok(mine.some(item => item.pnr_number === bookingPnr))

  const notifications = await request('/notifications', { token: passengerToken })
  assert.ok(notifications.length > 0)
  await request(`/notifications/${notifications[0].notification_id}/read`, {
    method: 'PATCH',
    token: passengerToken,
  })
  await request('/notifications/read-all', { method: 'PATCH', token: passengerToken })

  const cancelled = await request(`/bookings/${bookingPnr}/cancel`, {
    method: 'POST',
    token: passengerToken,
  })
  assert.equal(cancelled.status, 'cancelled')
  assert.equal(cancelled.refundRequested, true)
})

test('live status and stop timeline endpoints return the searched trip', async () => {
  const status = await request(`/trips/${searchedTrip.trip_id}/status`)
  const stops = await request(`/trips/${searchedTrip.trip_id}/stops`)
  const byCode = await request('/trains/SUBORNO/status')

  assert.equal(status.trip_id, searchedTrip.trip_id)
  assert.equal(stops.length, 4)
  assert.equal(byCode.train_code, 'SUBORNO')
})

test('operator can progress an assigned trip through every station', async () => {
  const trips = await request(`/operator/trips?date=${today()}`, { token: operatorToken })
  const trip = trips.find(item => Number(item.trip_id) === Number(searchedTrip.trip_id))
  assert.ok(trip)

  let operations = await request(`/operator/trips/${trip.trip_id}`, { token: operatorToken })
  for (const [index, stop] of operations.stops.entries()) {
    if (stop.scheduled_arrival) {
      await request(`/operator/trips/${trip.trip_id}/stops/${stop.trip_stop_id}/arrive`, {
        method: 'POST',
        token: operatorToken,
      })
    }
    if (stop.scheduled_departure) {
      await request(`/operator/trips/${trip.trip_id}/stops/${stop.trip_stop_id}/depart`, {
        method: 'POST',
        token: operatorToken,
      })
    }
    if (index < operations.stops.length - 1) {
      operations = await request(`/operator/trips/${trip.trip_id}`, { token: operatorToken })
    }
  }

  const completed = await request(`/operator/trips/${trip.trip_id}`, { token: operatorToken })
  assert.equal(completed.trip.trip_status, 'COMPLETED')
})

test('admin can inspect, edit, create and assign railway operations', async () => {
  const [routes, operators, trainsets, services] = await Promise.all([
    request('/admin/routes', { token: adminToken }),
    request('/admin/operators', { token: adminToken }),
    request('/admin/trainsets', { token: adminToken }),
    request('/admin/train-services', { token: adminToken }),
  ])
  assert.ok(routes.length >= 2)
  assert.ok(operators.length >= 1)
  assert.ok(trainsets.length >= 3)
  assert.ok(services.length >= 1)

  const details = await request(`/admin/train-services/${services[0].train_id}`, { token: adminToken })
  assert.equal(details.routes.length, 2)

  const updated = await request(`/admin/train-services/${services[0].train_id}`, {
    method: 'PATCH',
    token: adminToken,
    body: {
      trainName: details.train.train_name,
      trainCode: details.train.train_code,
      trainType: details.train.train_type,
      trainStatus: details.train.train_status,
      spareTriggerDelayMin: 75,
    },
  })
  assert.equal(updated.train.spare_trigger_delay_min, 75)

  const route = details.routes[0]
  const updatedRoute = await request(`/admin/routes/${route.route_id}`, {
    method: 'PATCH',
    token: adminToken,
    body: {
      trainNumber: route.train_number || '701',
      routeCode: route.route_code,
      isActive: 1,
    },
  })
  assert.equal(updatedRoute.route.route_code, route.route_code)

  const manualTrip = await requestRaw('/admin/trips', {
    method: 'POST',
    token: adminToken,
    body: { routeId: routes[0].route_id, scheduledDeparture: new Date().toISOString() },
  })
  assert.equal(manualTrip.status, 403)

  const scheduledTrips = await request(`/admin/trips?date=${today()}`, { token: adminToken })
  assert.ok(scheduledTrips.length > 0)

  const assigned = await request(`/admin/trips/${scheduledTrips[0].trip_id}/operator`, {
    method: 'PATCH',
    token: adminToken,
    body: { operatorUserId: operators[0].user_id },
  })
  assert.equal(assigned.operatorUserId, operators[0].user_id)

  const trainsetTrip = scheduledTrips.find(item =>
    item.trip_status === 'SCHEDULED' && item.source_station === 'Chattogram'
  )
  const availableTrainset = trainsets.find(item =>
    item.status === 'SPARE' && item.current_station === 'Chattogram'
  )
  assert.ok(trainsetTrip)
  assert.ok(availableTrainset)

  const trainsetAssignment = await request(`/admin/trips/${trainsetTrip.trip_id}/trainset`, {
    method: 'PATCH',
    token: adminToken,
    body: { trainsetId: availableTrainset.trainset_id },
  })
  assert.equal(trainsetAssignment.trainsetId, availableTrainset.trainset_id)
  assert.equal(trainsetAssignment.assignmentStatus, 'RESERVED')
})

test('unassigned departed trips are cancelled and confirmed bookings receive refund requests', async () => {
  const database = await import('../src/config/database.js')
  const { autoCancelUnassignedTrips } = await import('../src/services/schedule.service.js')

  const setup = await database.withTransaction(async connection => {
    const route = (await connection.query('SELECT * FROM ROUTES WHERE ROUTE_CODE = $1', ['SUB-UP'])).rows[0]
    const user = (await connection.query('SELECT USER_ID FROM USERS WHERE EMAIL = $1', ['passenger.test@ferrovia.local'])).rows[0]
    const classType = (await connection.query('SELECT CLASS_ID FROM CLASS_TYPES WHERE CLASS_CODE = $1', ['S_CHAIR'])).rows[0]
    const tripResult = await connection.query(
      `INSERT INTO TRIPS
        (TRAIN_ID, ROUTE_ID, JOURNEY_DATE, SCHEDULED_DEPARTURE, SCHEDULED_ARRIVAL, TRIP_STATUS)
       VALUES
        ($1, $2, CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '5 MINUTE',
         CURRENT_TIMESTAMP + INTERVAL '55 MINUTE', 'SCHEDULED')
       RETURNING TRIP_ID`,
      [route.TRAIN_ID, route.ROUTE_ID]
    )
    const tripId = tripResult.rows[0].TRIP_ID

    const { materializeTripSeats, materializeTripStops } = await import('../src/repositories/admin.repository.js')
    await materializeTripStops(connection, tripId)
    await materializeTripSeats(connection, tripId)

    const stops = (await connection.query(
      `SELECT STATION_ID, STOP_SEQUENCE
         FROM TRIP_STOPS
        WHERE TRIP_ID = $1
        ORDER BY STOP_SEQUENCE`,
      [tripId]
    )).rows
    const tripSeat = (await connection.query(
      `SELECT TS.TRIP_SEAT_ID
         FROM TRIP_SEATS TS
         JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
         JOIN COACHES C ON C.COACH_ID = S.COACH_ID
        WHERE TS.TRIP_ID = $1
          AND C.CLASS_ID = $2
        LIMIT 1`,
      [tripId, classType.CLASS_ID]
    )).rows[0]

    const booking = (await connection.query(
      `INSERT INTO BOOKINGS
        (PNR_NUMBER, USER_ID, TRIP_ID, SOURCE_STATION_ID, DESTINATION_STATION_ID,
         CLASS_ID, TOTAL_FARE, BOOKING_STATUS)
       VALUES
        ('AUTOREFUND1', $1, $2, $3, $4, $5, 100, 'CONFIRMED')
       RETURNING BOOKING_ID`,
      [
        user.USER_ID,
        tripId,
        stops[0].STATION_ID,
        stops[stops.length - 1].STATION_ID,
        classType.CLASS_ID,
      ]
    )).rows[0]
    const passenger = (await connection.query(
      `INSERT INTO PASSENGERS (BOOKING_ID, PASSENGER_NAME, AGE, GENDER)
       VALUES ($1, 'Auto Refund Passenger', 30, 'OTHER')
       RETURNING PASSENGER_ID`,
      [booking.BOOKING_ID]
    )).rows[0]
    const reservation = (await connection.query(
      `INSERT INTO SEAT_RESERVATIONS
        (BOOKING_ID, PASSENGER_ID, TRIP_SEAT_ID, SOURCE_STATION_ID, DESTINATION_STATION_ID,
         SOURCE_STOP_SEQUENCE, DESTINATION_STOP_SEQUENCE, RESERVATION_STATUS, BOOKED_AT)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, 'BOOKED', CURRENT_TIMESTAMP)
       RETURNING RESERVATION_ID`,
      [
        booking.BOOKING_ID,
        passenger.PASSENGER_ID,
        tripSeat.TRIP_SEAT_ID,
        stops[0].STATION_ID,
        stops[stops.length - 1].STATION_ID,
        stops[0].STOP_SEQUENCE,
        stops[stops.length - 1].STOP_SEQUENCE,
      ]
    )).rows[0]
    await connection.query(
      `INSERT INTO PAYMENTS (BOOKING_ID, TRANSACTION_ID, PAYMENT_AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
       VALUES ($1, 'AUTOREFUND-TXN-1', 100, 'CARD', 'SUCCESSFUL')`,
      [booking.BOOKING_ID]
    )
    await connection.query(
      `INSERT INTO TICKETS (PASSENGER_ID, RESERVATION_ID, TICKET_FARE, TICKET_STATUS)
       VALUES ($1, $2, 100, 'CONFIRMED')`,
      [passenger.PASSENGER_ID, reservation.RESERVATION_ID]
    )

    return { tripId, bookingId: booking.BOOKING_ID }
  })

  const result = await autoCancelUnassignedTrips()
  assert.ok(result.cancelledTrips >= 1)
  assert.ok(result.refundRequests >= 1)

  await database.withConnection(async connection => {
    const trip = (await connection.query('SELECT TRIP_STATUS FROM TRIPS WHERE TRIP_ID = $1', [setup.tripId])).rows[0]
    const booking = (await connection.query('SELECT BOOKING_STATUS FROM BOOKINGS WHERE BOOKING_ID = $1', [setup.bookingId])).rows[0]
    const refunds = (await connection.query(
      `SELECT COUNT(*)::INT AS REFUND_COUNT
         FROM REFUNDS RF
         JOIN TICKETS TK ON TK.TICKET_ID = RF.TICKET_ID
         JOIN PASSENGERS P ON P.PASSENGER_ID = TK.PASSENGER_ID
        WHERE P.BOOKING_ID = $1`,
      [setup.bookingId]
    )).rows[0]

    assert.equal(trip.TRIP_STATUS, 'CANCELLED')
    assert.equal(booking.BOOKING_STATUS, 'CANCELLED')
    assert.equal(Number(refunds.REFUND_COUNT), 1)
  })
})

test('admin can add a complete train service', async () => {
  const options = await request('/admin/train-form-options', { token: adminToken })
  const stations = options.stations
  const classType = options.classes[0]

  const service = await request('/admin/train-services', {
    method: 'POST',
    token: adminToken,
    body: {
      train: {
        trainName: 'Integration Express',
        trainCode: 'INT-EXP',
        trainType: 'INTERCITY',
        trainStatus: 'ACTIVE',
        spareTriggerDelayMin: 45,
      },
      routes: {
        up: {
          routeCode: 'INT-UP',
          trainNumber: '901',
          sourceStationId: stations[0].station_id,
          destinationStationId: stations[1].station_id,
          departureTime: '08:00',
          runningDays: ['SUN'],
          stops: [
            { stationId: stations[0].station_id, departureTime: '08:00', distanceKm: 0 },
            { stationId: stations[1].station_id, arrivalTime: '09:00', distanceKm: 60 },
          ],
        },
        down: {
          routeCode: 'INT-DOWN',
          trainNumber: '902',
          sourceStationId: stations[1].station_id,
          destinationStationId: stations[0].station_id,
          departureTime: '10:00',
          runningDays: ['SUN'],
          stops: [
            { stationId: stations[1].station_id, departureTime: '10:00', distanceKm: 0 },
            { stationId: stations[0].station_id, arrivalTime: '11:00', distanceKm: 60 },
          ],
        },
      },
      trainsets: [
        { trainsetCode: 'INT-01', status: 'SPARE', currentStationId: stations[0].station_id },
        { trainsetCode: 'INT-02', status: 'SPARE', currentStationId: stations[0].station_id },
        { trainsetCode: 'INT-03', status: 'SPARE', currentStationId: stations[1].station_id },
      ],
      fares: [{ classId: classType.class_id, ratePerKm: 2, baseFare: 50 }],
      coaches: [{ classId: classType.class_id, coachCode: 'A', seatCount: 4, seatType: 'REGULAR' }],
    },
  })

  assert.equal(service.trainName, 'Integration Express')
  assert.equal(service.trainsetCount, 3)
  assert.equal(service.seatCount, 4)
})
