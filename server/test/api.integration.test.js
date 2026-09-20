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

test('demo operator and admin accounts authenticate', async () => {
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

  const departure = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString()
  const createdTrip = await request('/admin/trips', {
    method: 'POST',
    token: adminToken,
    body: {
      routeId: routes[0].route_id,
      scheduledDeparture: departure,
      operatorUserId: operators[0].user_id,
    },
  })
  assert.ok(createdTrip.trip_id)

  const assigned = await request(`/admin/trips/${createdTrip.trip_id}/operator`, {
    method: 'PATCH',
    token: adminToken,
    body: { operatorUserId: operators[0].user_id },
  })
  assert.equal(assigned.operatorUserId, operators[0].user_id)
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
