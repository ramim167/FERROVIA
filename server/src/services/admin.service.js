import {
  withConnection,
  withTransaction
} from '../config/database.js'
import {
  assignOperator,
  getOperator,
  getRoute,
  listRoutes,
  listOperators,
  listAdminTrips,
  listTrainServices,
  getTrainServiceDetails,
  listTrainFormStations,
  listClassTypes,
  findExistingTrain,
  createTrainServiceRow,
  createRouteDefinition,
  createRouteStopDefinition,
  createRunningDayDefinition,
  createTrainsetDefinition,
  createFareRuleDefinition,
  createCoachDefinition,
  createSeatDefinition,
  updateTrainBasicInfo,
  updateRouteBasicInfo,
} from '../repositories/admin.repository.js'
import {
  cancelAssignment,
  createAssignment,
  getActiveAssignment,
  getTrainsetForUpdate,
  listTrainsets,
  releaseTrainset,
  setTrainsetStatus,
} from '../repositories/trainset.repository.js'
import { getTrip } from '../repositories/trip.repository.js'
import {
  badRequest,
  conflict,
  notFound
} from '../utils/httpError.js'
import {
  lowerKeys
} from '../utils/serializers.js'


const VALID_DAYS =
  new Set(['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'])

const VALID_TRAIN_STATUS =
  new Set(['ACTIVE', 'INACTIVE', 'CANCELLED'])

const VALID_TRAINSET_STATUS =
  new Set([
    'ACTIVE',
    'SPARE',
    'RESERVED',
    'MAINTENANCE',
    'OUT_OF_SERVICE',
  ])

const VALID_SEAT_TYPE =
  new Set(['REGULAR', 'WINDOW', 'AISLE', 'MIDDLE', 'BERTH'])

function clockToMinute(value, fieldName) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    throw badRequest(`${fieldName} must use HH:MM format`)
  }

  const [hour, minute] = value.split(':').map(Number)

  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw badRequest(`${fieldName} is invalid`)
  }

  return hour * 60 + minute
}

function offsetFromDeparture(clockTime, routeDepartureMinute) {
  if (!clockTime) return null

  const minute = clockToMinute(clockTime, 'stop time')

  let offset = minute - routeDepartureMinute

  if (offset < 0) {
    offset += 1440
  }

  return offset
}

function validateRoute(route, direction) {
  if (!route) {
    throw badRequest(`${direction} route is required`)
  }

  if (
    !route.routeCode ||
    !route.trainNumber ||
    !route.sourceStationId ||
    !route.destinationStationId ||
    !route.departureTime
  ) {
    throw badRequest(
      `${direction} route code, train number, source, destination and departure time are required`
    )
  }

  if (
    Number(route.sourceStationId) ===
    Number(route.destinationStationId)
  ) {
    throw badRequest(
      `${direction} source and destination cannot be the same`
    )
  }

  if (!Array.isArray(route.runningDays) || !route.runningDays.length) {
    throw badRequest(
      `${direction} must have at least one running day`
    )
  }

  for (const day of route.runningDays) {
    if (!VALID_DAYS.has(day)) {
      throw badRequest(`${direction} contains invalid running day`)
    }
  }

  if (!Array.isArray(route.stops) || route.stops.length < 2) {
    throw badRequest(
      `${direction} route must contain at least source and destination stops`
    )
  }

  const first = route.stops[0]
  const last = route.stops[route.stops.length - 1]

  if (
    Number(first.stationId) !==
    Number(route.sourceStationId)
  ) {
    throw badRequest(
      `${direction} first stop must be the source station`
    )
  }

  if (
    Number(last.stationId) !==
    Number(route.destinationStationId)
  ) {
    throw badRequest(
      `${direction} last stop must be the destination station`
    )
  }

  const stationIds = route.stops.map(stop => Number(stop.stationId))

  if (
    stationIds.some(id => !id) ||
    new Set(stationIds).size !== stationIds.length
  ) {
    throw badRequest(
      `${direction} stops must contain unique valid stations`
    )
  }

  const departureMinute =
    clockToMinute(
      route.departureTime,
      `${direction} departure time`
    )

  const normalizedStops = route.stops.map((stop, index) => {
    let arrivalOffsetMin =
      offsetFromDeparture(
        stop.arrivalTime || null,
        departureMinute
      )

    let departureOffsetMin =
      offsetFromDeparture(
        stop.departureTime || null,
        departureMinute
      )

    if (index === 0) {
      arrivalOffsetMin = null
      departureOffsetMin = 0
    }

    if (index === route.stops.length - 1) {
      departureOffsetMin = null

      if (arrivalOffsetMin === null) {
        throw badRequest(
          `${direction} destination arrival time is required`
        )
      }
    }

    if (
      index > 0 &&
      index < route.stops.length - 1 &&
      (
        arrivalOffsetMin === null ||
        departureOffsetMin === null
      )
    ) {
      throw badRequest(
        `${direction} intermediate stops need both arrival and departure time`
      )
    }

    if (
      arrivalOffsetMin !== null &&
      departureOffsetMin !== null &&
      departureOffsetMin < arrivalOffsetMin
    ) {
      throw badRequest(
        `${direction} stop ${index + 1}: departure cannot be before arrival`
      )
    }

    const distanceKm = Number(stop.distanceKm)

    if (
      Number.isNaN(distanceKm) ||
      distanceKm < 0
    ) {
      throw badRequest(
        `${direction} stop ${index + 1}: invalid distance`
      )
    }

    return {
      stationId: Number(stop.stationId),
      stopSequence: index + 1,
      arrivalOffsetMin,
      departureOffsetMin,
      distanceKm,
    }
  })

  for (let i = 1; i < normalizedStops.length; i++) {
    if (
      normalizedStops[i].distanceKm <
      normalizedStops[i - 1].distanceKm
    ) {
      throw badRequest(
        `${direction} stop distance must increase from source to destination`
      )
    }

    const previous =
      normalizedStops[i - 1].departureOffsetMin ??
      normalizedStops[i - 1].arrivalOffsetMin ??
      0

    const current =
      normalizedStops[i].arrivalOffsetMin ??
      normalizedStops[i].departureOffsetMin ??
      0

    if (current < previous) {
      throw badRequest(
        `${direction} stop times are not in journey order`
      )
    }
  }

  return {
    routeCode: route.routeCode.trim(),
    trainNumber: String(route.trainNumber).trim(),
    direction,
    sourceStationId: Number(route.sourceStationId),
    destinationStationId: Number(route.destinationStationId),
    departureMinute,
    runningDays: route.runningDays,
    stops: normalizedStops,
  }
}

async function validateOperator(connection, operatorUserId) {
  if (!operatorUserId) return

  const user = await getOperator(connection, Number(operatorUserId))

  if (!user) {
    throw notFound('Operator user not found')
  }

  const role = String(user.ROLE ?? user.role ?? '').toUpperCase()
  const accountStatus = String(user.ACCOUNT_STATUS ?? user.account_status ?? '').toUpperCase()

  if (
    role !== 'OPERATOR' ||
    accountStatus !== 'ACTIVE'
  ) {
    throw badRequest('Assigned user must be an active OPERATOR')
  }
}

export async function trainFormOptions() {
  return withConnection(async (connection) => {
    const [stations, classes] = await Promise.all([
      listTrainFormStations(connection),
      listClassTypes(connection),
    ])

    return {
      stations: lowerKeys(stations),
      classes: lowerKeys(classes),
    }
  })
}

export async function trainServices() {
  return withConnection(async (connection) => {
    const rows = await listTrainServices(connection)

    return lowerKeys(rows)
  })
}

export async function trainServiceDetails(trainId) {

  if (!trainId || Number.isNaN(Number(trainId))) {
    throw badRequest('Valid train ID is required')
  }

  return withConnection(async (connection) => {

    const data = await getTrainServiceDetails(
      connection,
      Number(trainId)
    )

    if (!data) {
      throw notFound('Train not found')
    }

    return {
      train: lowerKeys(data.train),
      routes: lowerKeys(data.routes),
      routeStops: lowerKeys(data.routeStops),
      runningDays: lowerKeys(data.runningDays),
      trainsets: lowerKeys(data.trainsets),
      fares: lowerKeys(data.fares),
      coaches: lowerKeys(data.coaches),
      classes: lowerKeys(data.classes),
    }
  })
}

export async function updateTrainInfo(trainId, payload = {}) {

  const id = Number(trainId)

  if (!id || Number.isNaN(id)) {
    throw badRequest('Valid train ID is required')
  }


  const trainName = String(payload.trainName || '').trim()
  const trainCode = String(payload.trainCode || '').trim()
  const trainType = String(payload.trainType || '').trim()
  const trainStatus = String(payload.trainStatus || '').trim()

  const spareTriggerDelayMin =
    Number(payload.spareTriggerDelayMin)


  if (!trainName) {
    throw badRequest('Train name is required')
  }

  if (!trainCode) {
    throw badRequest('Train code is required')
  }

  if (!trainType) {
    throw badRequest('Train type is required')
  }

  if (!trainStatus) {
    throw badRequest('Train status is required')
  }

  if (
    Number.isNaN(spareTriggerDelayMin) ||
    spareTriggerDelayMin < 0
  ) {
    throw badRequest(
      'Spare trigger delay must be zero or a positive number'
    )
  }


  return withTransaction(async (connection) => {

    const rowsAffected = await updateTrainBasicInfo(
      connection,
      {
        trainId: id,
        trainName,
        trainCode,
        trainType,
        trainStatus,
        spareTriggerDelayMin,
      }
    )


    if (!rowsAffected) {
      throw notFound('Train not found')
    }


    const updated = await getTrainServiceDetails(
      connection,
      id
    )


    return {
      train: lowerKeys(updated.train),
    }
  })
}


export async function updateRouteInfo(routeId, payload = {}) {

  const id = Number(routeId)

  if (!id || Number.isNaN(id)) {
    throw badRequest('Valid route ID is required')
  }


  const trainNumber =
    String(payload.trainNumber || '').trim()

  const routeCode =
    String(payload.routeCode || '').trim()

  const isActive =
    Number(payload.isActive)


  if (!trainNumber) {
    throw badRequest('Train number is required')
  }

  if (!routeCode) {
    throw badRequest('Route code is required')
  }

  if (![0, 1].includes(isActive)) {
    throw badRequest(
      'Route active status must be 0 or 1'
    )
  }


  return withTransaction(async (connection) => {

    const rowsAffected =
      await updateRouteBasicInfo(
        connection,
        {
          routeId: id,
          trainNumber,
          routeCode,
          isActive,
        }
      )


    if (!rowsAffected) {
      throw notFound('Route not found')
    }


    const route = await getRoute(
      connection,
      id
    )


    return {
      route: lowerKeys(route),
    }
  })
}

export async function routes() {
  return withConnection(async (connection) => lowerKeys(await listRoutes(connection)))
}

export async function operators() {
  return withConnection(async (connection) => lowerKeys(await listOperators(connection)))
}

export async function trips(date) {
  return withConnection(async (connection) => lowerKeys(await listAdminTrips(connection, date || null)))
}

export async function trainsets(trainId) {
  return withConnection(async (connection) => lowerKeys(await listTrainsets(connection, trainId || null)))
}

export async function setOperator(tripId, operatorUserId) {
  return withTransaction(async (connection) => {
    await validateOperator(connection, operatorUserId)
    await assignOperator(connection, Number(tripId), Number(operatorUserId))
    return {
      tripId: Number(tripId),
      operatorUserId: Number(operatorUserId)
    }
  })
}

export async function setTrainset(tripId, trainsetId) {
  const normalizedTripId = Number(tripId)
  const normalizedTrainsetId = Number(trainsetId)

  if (!normalizedTripId || !normalizedTrainsetId) {
    throw badRequest('Valid trip and trainset IDs are required')
  }

  return withTransaction(async connection => {
    const trip = await getTrip(connection, normalizedTripId, true)
    if (!trip) throw notFound('Trip not found')
    if (!['SCHEDULED', 'BOARDING'].includes(String(trip.TRIP_STATUS).toUpperCase())) {
      throw conflict('A trainset can only be assigned to a scheduled or boarding trip')
    }

    const trainset = await getTrainsetForUpdate(connection, normalizedTrainsetId)
    if (!trainset) throw notFound('Trainset not found')
    if (Number(trainset.TRAIN_ID) !== Number(trip.TRAIN_ID)) {
      throw badRequest('The selected trainset belongs to a different train service')
    }

    const current = await getActiveAssignment(connection, normalizedTripId)
    if (current && Number(current.TRAINSET_ID) === normalizedTrainsetId) {
      return {
        tripId: normalizedTripId,
        trainsetId: normalizedTrainsetId,
        trainsetCode: trainset.TRAINSET_CODE,
        assignmentStatus: current.ASSIGNMENT_STATUS,
      }
    }

    if (String(trainset.STATUS).toUpperCase() !== 'SPARE') {
      throw conflict('Only a SPARE trainset can be assigned')
    }
    if (
      trainset.CURRENT_STATION_ID &&
      Number(trainset.CURRENT_STATION_ID) !== Number(trip.SOURCE_STATION_ID)
    ) {
      throw conflict('The trainset is not available at this trip’s departure station')
    }

    if (current) {
      await cancelAssignment(connection, current.ASSIGNMENT_ID, 'Replaced by an admin assignment')
      await releaseTrainset(connection, current.TRAINSET_ID)
    }

    await createAssignment(connection, {
      tripId: normalizedTripId,
      trainsetId: normalizedTrainsetId,
      trainId: trip.TRAIN_ID,
      type: 'MANUAL',
      status: 'RESERVED',
      reason: 'Assigned by admin',
    })
    await setTrainsetStatus(
      connection,
      normalizedTrainsetId,
      'RESERVED',
      trip.SOURCE_STATION_ID
    )

    return {
      tripId: normalizedTripId,
      trainsetId: normalizedTrainsetId,
      trainsetCode: trainset.TRAINSET_CODE,
      assignmentStatus: 'RESERVED',
    }
  })
}


export async function createTrainService(payload) {
  const {
    train,
    routes: routePayload,
    trainsets = [],
    fares = [],
    coaches = [],
  } = payload || {}

  if (
    !train?.trainName ||
    !train?.trainCode ||
    !train?.trainType
  ) {
    throw badRequest(
      'Train name, service code and train type are required'
    )
  }

  const trainStatus =
    train.trainStatus || 'ACTIVE'

  if (!VALID_TRAIN_STATUS.has(trainStatus)) {
    throw badRequest('Invalid train status')
  }

  const spareTriggerDelayMin =
    Number(train.spareTriggerDelayMin ?? 60)

  if (
    Number.isNaN(spareTriggerDelayMin) ||
    spareTriggerDelayMin < 0
  ) {
    throw badRequest('Invalid spare trigger delay')
  }

  const up =
    validateRoute(routePayload?.up, 'UP')

  const down =
    validateRoute(routePayload?.down, 'DOWN')

  if (
    up.sourceStationId !== down.destinationStationId ||
    up.destinationStationId !== down.sourceStationId
  ) {
    throw badRequest(
      'DOWN route must be the opposite terminal direction of UP route'
    )
  }

  if (up.trainNumber === down.trainNumber) {
    throw badRequest(
      'UP and DOWN train numbers must be different'
    )
  }

  if (up.routeCode === down.routeCode) {
    throw badRequest(
      'UP and DOWN route codes must be different'
    )
  }

  if (!Array.isArray(trainsets) || trainsets.length < 3) {
    throw badRequest(
      'At least 3 physical trainsets are required'
    )
  }

  if (!Array.isArray(fares) || !fares.length) {
    throw badRequest(
      'At least one class fare is required'
    )
  }

  if (!Array.isArray(coaches) || !coaches.length) {
    throw badRequest(
      'At least one coach is required'
    )
  }

  return withTransaction(async (connection) => {
    const existing =
      await findExistingTrain(
        connection,
        train.trainName,
        train.trainCode
      )

    if (existing) {
      throw conflict(
        'Train name or service code already exists'
      )
    }

    const classRows =
      await listClassTypes(connection)

    const validClassIds =
      new Set(
        classRows.map(row => Number(row.CLASS_ID))
      )

    const fareClassIds = new Set()

    for (const fare of fares) {
      const classId = Number(fare.classId)
      const ratePerKm = Number(fare.ratePerKm)
      const baseFare = Number(fare.baseFare || 0)

      if (!validClassIds.has(classId)) {
        throw badRequest('Invalid fare class')
      }

      if (
        Number.isNaN(ratePerKm) ||
        ratePerKm <= 0 ||
        Number.isNaN(baseFare) ||
        baseFare < 0
      ) {
        throw badRequest('Invalid fare amount')
      }

      if (fareClassIds.has(classId)) {
        throw badRequest(
          'A class can only have one fare rule per train'
        )
      }

      fareClassIds.add(classId)
    }

    for (const coach of coaches) {
      const classId = Number(coach.classId)

      if (!validClassIds.has(classId)) {
        throw badRequest('Invalid coach class')
      }

      if (!fareClassIds.has(classId)) {
        throw badRequest(
          'Every coach class must have a fare rule'
        )
      }

      if (
        !coach.coachCode ||
        Number(coach.seatCount) <= 0
      ) {
        throw badRequest(
          'Coach code and positive seat count are required'
        )
      }

      if (
        !VALID_SEAT_TYPE.has(
          coach.seatType || 'REGULAR'
        )
      ) {
        throw badRequest('Invalid seat type')
      }
    }

    const trainId =
      await createTrainServiceRow(
        connection,
        {
          trainName: train.trainName.trim(),
          trainType: train.trainType.trim(),
          trainCode: train.trainCode.trim(),
          trainStatus,
          spareTriggerDelayMin,
        }
      )

    const routeIds = {}

    for (const route of [up, down]) {
      const routeId =
        await createRouteDefinition(
          connection,
          {
            trainId,
            routeCode: route.routeCode,
            trainNumber: route.trainNumber,
            direction: route.direction,
            sourceStationId: route.sourceStationId,
            destinationStationId:
              route.destinationStationId,
          }
        )

      routeIds[route.direction.toLowerCase()] =
        routeId

      for (const stop of route.stops) {
        await createRouteStopDefinition(
          connection,
          {
            routeId,
            ...stop,
          }
        )
      }

      for (const dayCode of route.runningDays) {
        await createRunningDayDefinition(
          connection,
          {
            routeId,
            dayCode,
            departureMinute:
              route.departureMinute,
          }
        )
      }
    }

    const allowedTerminalIds =
      new Set([
        up.sourceStationId,
        up.destinationStationId,
      ])

    const trainsetCodes = new Set()

    for (const trainset of trainsets) {
      const code =
        String(trainset.trainsetCode || '').trim()

      const status =
        trainset.status || 'SPARE'

      const currentStationId =
        Number(trainset.currentStationId)

      if (!code) {
        throw badRequest(
          'Every trainset needs a trainset code'
        )
      }

      if (trainsetCodes.has(code.toUpperCase())) {
        throw badRequest(
          'Trainset codes must be unique'
        )
      }

      trainsetCodes.add(code.toUpperCase())

      if (!VALID_TRAINSET_STATUS.has(status)) {
        throw badRequest(
          `Invalid trainset status for ${code}`
        )
      }

      if (!allowedTerminalIds.has(currentStationId)) {
        throw badRequest(
          `Trainset ${code} must initially be at one of the route terminals`
        )
      }

      await createTrainsetDefinition(
        connection,
        {
          trainId,
          trainsetCode: code,
          status,
          currentStationId,
        }
      )
    }

    for (const fare of fares) {
      await createFareRuleDefinition(
        connection,
        {
          trainId,
          classId: Number(fare.classId),
          ratePerKm: Number(fare.ratePerKm),
          baseFare: Number(fare.baseFare || 0),
        }
      )
    }

    let totalSeats = 0

    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i]

      const coachId =
        await createCoachDefinition(
          connection,
          {
            trainId,
            classId: Number(coach.classId),
            coachCode:
              String(coach.coachCode)
                .trim()
                .toUpperCase(),
            coachOrder: i + 1,
          }
        )

      const seatCount =
        Number(coach.seatCount)

      const seatType =
        coach.seatType || 'REGULAR'

      for (
        let seatNumber = 1;
        seatNumber <= seatCount;
        seatNumber++
      ) {
        await createSeatDefinition(
          connection,
          {
            coachId,
            seatNumber:
              String(seatNumber),
            seatType,
          }
        )

        totalSeats++
      }
    }

    return {
      trainId,
      trainName: train.trainName.trim(),
      upRouteId: routeIds.up,
      downRouteId: routeIds.down,
      trainsetCount: trainsets.length,
      fareCount: fares.length,
      coachCount: coaches.length,
      seatCount: totalSeats,
    }
  })
}
