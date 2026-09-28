import { withConnection } from '../config/database.js'
import { searchTrips, getLiveStatusByTrainCode } from '../repositories/train.repository.js'
import { listStations } from '../repositories/station.repository.js'
import { getTrainProfile, listTrainRunningSchedules, listUpcomingTrips } from '../repositories/chat.repository.js'
import { availableClasses } from './booking.service.js'
import { badRequest } from '../utils/httpError.js'
import { lowerKeys } from '../utils/serializers.js'

const DAY_ORDER = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI']
const DAY_NAMES = {
  SAT: 'Saturday',
  SUN: 'Sunday',
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
}
const BANGLA_ALIASES = [
  ['রংপুর', 'rangpur'],
  ['রংপুর এক্সপ্রেস', 'rangpur express'],
  ['সুবর্ণ', 'suborno'],
  ['সুবর্ণ এক্সপ্রেস', 'suborno express'],
  ['পর্যটক', 'parjotak'],
  ['পর্যটক এক্সপ্রেস', 'parjotak express'],
  ['পারজাতক', 'parjotak'],
  ['পারজাতক এক্সপ্রেস', 'parjotak express'],
  ['ঢাকা', 'dhaka'],
  ['চট্টগ্রাম', 'chattogram'],
  ['চিটাগং', 'chattogram'],
  ['রাজশাহী', 'rajshahi'],
  ['সিলেট', 'sylhet'],
  ['খুলনা', 'khulna'],
  ['বরিশাল', 'barishal'],
  ['পার্বতীপুর', 'parbatipur'],
  ['নারায়ণগঞ্জ', 'narayanganj'],
  ['নারায়ণগঞ্জ', 'narayanganj'],
  ['এক্সপ্রেস', 'express'],
  ['ট্রেন', 'train'],
]

async function trainSearch(args) {
  const { from, to, date } = args
  if (!from || !to || !date) return { error: 'from, to and date are required' }

  const trips = await withConnection(async (connection) =>
    lowerKeys(await searchTrips(connection, { from, to, date }))
  )

  const enriched = []
  for (const trip of trips.slice(0, 8)) {
    let classes = []
    try {
      classes = await availableClasses({
        tripId: trip.trip_id,
        sourceStationId: trip.source_station_id,
        destinationStationId: trip.destination_station_id,
      })
    } catch {
      classes = []
    }
    enriched.push({ ...trip, classes })
  }

  return { count: trips.length, trips: enriched }
}

function extractStationPair(message, stations) {
  const text = normalizeText(message)
  const matches = stations
    .map((station) => ({
      name: station.station_name,
      index: text.indexOf(normalizeText(station.station_name)),
    }))
    .filter((station) => station.index >= 0)
    .sort((a, b) => a.index - b.index)
    .map((station) => station.name)
  return [...new Set(matches)].slice(0, 2)
}

function extractDate(message) {
  const exact = message.match(/\b\d{4}-\d{2}-\d{2}\b/)
  if (exact) return exact[0]
  const now = new Date()
  const offset = /tomorrow|tmrw|kalke|kal|আগামীকাল|কাল/i.test(message) ? 1 : 0
  now.setDate(now.getDate() + offset)
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' })
}

function formatTime(value) {
  if (!value) return 'not listed'
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Dhaka',
  })
}

function formatMinute(minute) {
  const total = Number(minute || 0)
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  const date = new Date(Date.UTC(2020, 0, 1, hours, minutes))
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
}

function normalizeText(value) {
  let text = String(value || '').toLowerCase()
  for (const [bangla, english] of BANGLA_ALIASES) {
    text = text.replaceAll(bangla, ` ${english} `)
  }
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, ' ')
    .trim()
}

function levenshtein(a, b) {
  const left = normalizeText(a)
  const right = normalizeText(b)
  if (!left || !right) return Math.max(left.length, right.length)
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i += 1) {
    let last = i - 1
    previous[0] = i
    for (let j = 1; j <= right.length; j += 1) {
      const old = previous[j]
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, last + cost)
      last = old
    }
  }
  return previous[right.length]
}

function trainQueryFromMessage(message) {
  return normalizeText(message)
    .replace(/\b(what|when|where|which|how|does|do|tell|me|about|show|give|list|off|day|days|weekly|schedule|running|run|runs|train|express|route|routes|stop|stops|station|stations|fare|price|cost|class|seat|seats|available|availability|time|timing|leave|leaves|depart|departs|arrival|arrive|arrives|status|delay|late|track|location|current|now|the|is|ki|kothay|kothai|koi|ekhon|akhon|kobe|kokhon|chare|chara|charbe|jay|jabe|bondho|bondho|closed|holiday|ache|ase)\b/g, ' ')
    .replace(/[কি|কী|কোথায়|কোথায়|কই|এখন|বন্ধ|ছাড়ে|ছাড়ে|ছাড়বে|ছাড়বে|কখন|কবে|রুট|স্টপ|ভাড়া|ভাড়া|সিট|দেরি|লেট|চলে|চলবে|আছে|যাবে]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function groupSchedules(rows) {
  const trains = new Map()
  for (const row of rows) {
    const id = Number(row.train_id)
    if (!trains.has(id)) {
      trains.set(id, {
        trainId: id,
        trainName: row.train_name,
        trainCode: row.train_code,
        trainType: row.train_type,
        routes: [],
        runningDays: new Set(),
      })
    }
    const train = trains.get(id)
    let route = train.routes.find((item) => item.routeId === Number(row.route_id))
    if (!route) {
      route = {
        routeId: Number(row.route_id),
        direction: row.direction,
        sourceStation: row.source_station,
        destinationStation: row.destination_station,
        days: [],
      }
      train.routes.push(route)
    }
    if (row.day_code) {
      train.runningDays.add(row.day_code)
      route.days.push({
        dayCode: row.day_code,
        dayName: DAY_NAMES[row.day_code] || row.day_code,
        departureTime: formatMinute(row.departure_minute),
      })
    }
  }

  return [...trains.values()].map((train) => ({
    ...train,
    runningDays: DAY_ORDER.filter((day) => train.runningDays.has(day)),
    offDays: DAY_ORDER.filter((day) => !train.runningDays.has(day)),
    routes: train.routes.map((route) => ({
      ...route,
      days: DAY_ORDER
        .filter((day) => route.days.some((item) => item.dayCode === day))
        .map((day) => route.days.find((item) => item.dayCode === day)),
    })),
  }))
}

function bestTrainMatch(message, trains) {
  const query = trainQueryFromMessage(message)
  const messageNorm = normalizeText(message)
  let best = null
  for (const train of trains) {
    const name = normalizeText(train.trainName)
    const code = normalizeText(train.trainCode)
    const compactName = name.replace(/\bexpress\b/g, '').trim()
    const candidates = [name, compactName, code, `${name} ${code}`]
    const direct = candidates.some((candidate) => candidate && messageNorm.includes(candidate))
    const includes = query && candidates.some((candidate) => candidate.includes(query) || query.includes(candidate))
    const distance = query ? Math.min(...candidates.map((candidate) => levenshtein(query, candidate))) : 999
    const score = direct || includes ? 0 : distance / Math.max(query.length, name.length, 1)
    if (!best || score < best.score) best = { train, score }
  }
  return best && best.score <= 0.45 ? best.train : null
}

function buildTrainProfile(profile) {
  if (!profile) return null
  const normalized = lowerKeys(profile)
  const routes = normalized.routes.map((route) => {
    const routeDays = normalized.runningdays
      .filter((day) => Number(day.route_id) === Number(route.route_id))
      .map((day) => ({
        dayCode: day.day_code,
        dayName: DAY_NAMES[day.day_code] || day.day_code,
        departureTime: formatMinute(day.departure_minute),
      }))
    const routeStops = normalized.stops
      .filter((stop) => Number(stop.route_id) === Number(route.route_id))
      .map((stop) => ({
        stationName: stop.station_name,
        stationCode: stop.station_code,
        sequence: stop.stop_sequence,
        arrivalOffsetMin: stop.arrival_offset_min,
        departureOffsetMin: stop.departure_offset_min,
        distanceKm: stop.distance_from_source_km,
      }))

    return {
      routeId: route.route_id,
      routeCode: route.route_code,
      direction: route.direction,
      sourceStation: route.source_station,
      destinationStation: route.destination_station,
      days: DAY_ORDER
        .filter((day) => routeDays.some((item) => item.dayCode === day))
        .map((day) => routeDays.find((item) => item.dayCode === day)),
      stops: routeStops,
    }
  })

  const runningDaySet = new Set(routes.flatMap((route) => route.days.map((day) => day.dayCode)))
  return {
    trainId: normalized.train.train_id,
    trainName: normalized.train.train_name,
    trainCode: normalized.train.train_code,
    trainType: normalized.train.train_type,
    trainStatus: normalized.train.train_status,
    spareTriggerDelayMin: normalized.train.spare_trigger_delay_min,
    runningDays: DAY_ORDER.filter((day) => runningDaySet.has(day)),
    offDays: DAY_ORDER.filter((day) => !runningDaySet.has(day)),
    routes,
    fares: normalized.fares.map((fare) => ({
      className: fare.class_name,
      classCode: fare.class_code,
      baseFare: fare.base_fare,
      ratePerKm: fare.rate_per_km,
    })),
    upcomingTrips: normalized.upcomingtrips.map((trip) => ({
      tripId: trip.trip_id,
      direction: trip.direction,
      sourceStation: trip.source_station,
      destinationStation: trip.destination_station,
      journeyDate: trip.journey_date,
      scheduledDeparture: trip.scheduled_departure,
      scheduledArrival: trip.scheduled_arrival,
      tripStatus: trip.trip_status,
      currentDelayMinutes: trip.current_delay_minutes,
      lastLeftStation: trip.last_left_station,
      nextStation: trip.next_station,
    })),
    liveStatus: normalized.livestatus,
  }
}

async function trainProfileLookup(message) {
  const rows = await withConnection(async (connection) => lowerKeys(await listTrainRunningSchedules(connection)))
  const trains = groupSchedules(rows)
  const train = bestTrainMatch(message, trains)
  if (!train) {
    return {
      train: null,
      knownTrainNames: trains.slice(0, 8).map((item) => item.trainName),
    }
  }
  const profile = await withConnection(async (connection) => getTrainProfile(connection, train.trainId))
  return {
    train: buildTrainProfile(profile),
    knownTrainNames: trains.slice(0, 8).map((item) => item.trainName),
  }
}

function looksLikeTrainQuestion(message) {
  const text = normalizeText(message)
  return /express|train|off\s*day|offday|weekly|schedule|running days?|run days?|route|stops?|stations?|fare|price|cost|class|seat|available|availability|time|timing|leave|depart|arrival|status|delay|late|track|location|where|koi|kothay|kothai|ekhon|akhon|now|bondho|closed|holiday|কি|কী|কোথায়|কোথায়|কই|এখন|বন্ধ|রুট|স্টপ|ভাড়া|ভাড়া|সিট|দেরি|লেট|কখন|কবে/.test(text)
}

function trainProfileAnswer(message, train) {
  const text = normalizeText(message)
  const runningDays = train.runningDays.map((day) => DAY_NAMES[day]).join(', ')
  const offDays = train.offDays.map((day) => DAY_NAMES[day]).join(', ')
  const nextTrip = train.upcomingTrips[0]

  if (/\b(where|koi|kothay|kothai|ekhon|akhon|now|track|status|delay|late|location|current)\b|কোথায়|কোথায়|কই|এখন|দেরি|লেট/.test(text)) {
    if (train.liveStatus) {
      const status = lowerKeys(train.liveStatus)
      return `${train.trainName} (${train.trainCode}) is ${status.trip_status || 'active'} now. Last left: ${status.last_left_station || 'not updated'}; next station: ${status.next_station || 'not listed'}; delay: ${Number(status.current_delay_minutes || 0)} min.`
    }
    if (nextTrip) {
      return `${train.trainName} (${train.trainCode}) is not currently marked running. Next listed trip is ${nextTrip.sourceStation} to ${nextTrip.destinationStation} at ${formatTime(nextTrip.scheduledDeparture)}, status ${nextTrip.tripStatus}, delay ${Number(nextTrip.currentDelayMinutes || 0)} min.`
    }
    return `${train.trainName} (${train.trainCode}) has no current running or upcoming trip listed.`
  }

  if (/\b(off|offday|closed|holiday|bondho)\b|বন্ধ/.test(text)) {
    return offDays
      ? `${train.trainName} (${train.trainCode}) off day: ${offDays}.`
      : `${train.trainName} (${train.trainCode}) has no weekly off day listed. It runs on ${runningDays || 'no listed days'}.`
  }

  if (/\b(route|routes|stop|stops|station|stations)\b|রুট|স্টপ/.test(text)) {
    const routeText = train.routes
      .map((route) => `${route.sourceStation} to ${route.destinationStation}: ${route.stops.map((stop) => stop.stationName).join(' -> ')}`)
      .join('; ')
    return `${train.trainName} (${train.trainCode}) routes: ${routeText}.`
  }

  if (/\b(fare|price|cost|class|seat|seats|available|availability)\b|ভাড়া|ভাড়া|সিট|ক্লাস/.test(text)) {
    const fareText = train.fares.map((fare) => `${fare.className}: base ${fare.baseFare}, per km ${fare.ratePerKm}`).join('; ')
    return fareText
      ? `${train.trainName} (${train.trainCode}) fare rules: ${fareText}. Search a route/date in the app to see exact fare and live seat availability.`
      : `${train.trainName} (${train.trainCode}) has no fare rules listed.`
  }

  if (/\b(schedule|weekly|running|run|runs|time|timing|leave|leaves|depart|departs|arrival|arrive|arrives|kokhon|kobe|chare|charbe|jay|jabe)\b|কখন|কবে|ছাড়ে|ছাড়ে|ছাড়বে|ছাড়বে|চলে|চলবে|যাবে/.test(text)) {
    const routeText = train.routes
      .map((route) => `${route.sourceStation} to ${route.destinationStation}: ${route.days.map((day) => `${day.dayName} ${day.departureTime}`).join(', ') || 'not scheduled'}`)
      .join('; ')
    return `${train.trainName} (${train.trainCode}) runs on ${runningDays || 'no listed days'}.${offDays ? ` Off day: ${offDays}.` : ''} Schedule: ${routeText}.`
  }

  if (nextTrip) {
    return `${train.trainName} (${train.trainCode}) is a ${train.trainType || 'train'} service. Next listed trip: ${nextTrip.sourceStation} to ${nextTrip.destinationStation} at ${formatTime(nextTrip.scheduledDeparture)}, status ${nextTrip.tripStatus}.`
  }
  return `${train.trainName} (${train.trainCode}) is a ${train.trainType || 'train'} service. It runs on ${runningDays || 'no listed days'}${offDays ? `, with off day ${offDays}` : ''}.`
}

async function collectRailwayContext(message) {
  const stations = await withConnection(async (connection) => lowerKeys(await listStations(connection)))
  const [from, to] = extractStationPair(message, stations)

  if (from && to) {
    const date = extractDate(message)
    const result = await trainSearch({ from, to, date })
    return {
      kind: 'route_search',
      query: { from, to, date },
      result,
    }
  }

  const trainCodeMatch = message.match(/\b[A-Z]{1,5}[-\s]?\d{1,5}\b/)
  if (trainCodeMatch && /status|delay|late|running|track|where|koi|kothay|ekhon|now|কোথায়|কোথায়|কই|এখন/i.test(message)) {
    const trainCode = trainCodeMatch[0].replace(/\s+/g, '-').toUpperCase()
    const status = await withConnection(async (connection) => getLiveStatusByTrainCode(connection, trainCode))
    return {
      kind: 'train_status',
      query: { trainCode },
      result: status ? lowerKeys(status) : null,
    }
  }

  if (looksLikeTrainQuestion(message)) {
    const result = await trainProfileLookup(message)
    return {
      kind: 'train_profile',
      query: { message },
      result,
    }
  }

  const upcoming = await withConnection(async (connection) => lowerKeys(await listUpcomingTrips(connection, 8)))
  return {
    kind: 'upcoming_trips',
    query: {},
    result: upcoming,
  }
}

function bestTripFromResults(trips) {
  return [...trips].sort((a, b) => {
    const delayDiff = Number(a.current_delay_minutes || 0) - Number(b.current_delay_minutes || 0)
    if (delayDiff) return delayDiff
    return new Date(a.scheduled_departure) - new Date(b.scheduled_departure)
  })[0]
}

function routeSearchAnswer(message, query, result) {
  const { from, to, date } = query
  if (!result.trips.length) {
    return `I could not find scheduled trains from ${from} to ${to} on ${date}. Try another date or station pair.`
  }

  const asksBest = /\b(best|choose|suggest|recommend|bhalo|valo|which|kon)\b|ভালো|ভাল|কোন/i.test(message)
  const asksEarliest = /\b(earliest|first|age|shobar age|fast)\b|আগে|প্রথম/i.test(message)
  const selected = asksBest ? bestTripFromResults(result.trips) : result.trips[0]
  const classes = (selected.classes || [])
    .filter((item) => Number(item.availableSeats) > 0)
    .slice(0, 3)
    .map((item) => `${item.className}: ${item.availableSeats} seats, fare ${item.farePerPassenger ?? 'N/A'}`)
    .join('; ')
  const reason = asksBest
    ? 'recommended option'
    : asksEarliest
      ? 'earliest listed option'
      : 'listed option'

  if (result.trips.length === 1 || asksBest || asksEarliest) {
    return `${selected.train_name} (${selected.train_code}) is the ${reason} from ${from} to ${to} on ${date}. It leaves at ${formatTime(selected.scheduled_departure)} and arrives at ${formatTime(selected.scheduled_arrival)}. Delay: ${Number(selected.current_delay_minutes || 0)} min.${classes ? ` Available classes: ${classes}.` : ''}`
  }

  const lines = result.trips.slice(0, 5).map((trip) => `${trip.train_name} (${trip.train_code}) leaves ${formatTime(trip.scheduled_departure)}, arrives ${formatTime(trip.scheduled_arrival)}, delay ${Number(trip.current_delay_minutes || 0)} min`)
  return `I found ${result.count} train(s) from ${from} to ${to} on ${date}: ${lines.join('; ')}.`
}

async function directReply(message) {
  const context = await collectRailwayContext(message)

  if (context.kind === 'route_search') {
    return routeSearchAnswer(message, context.query, context.result)
  }

  if (context.kind === 'train_status') {
    if (!context.result) return `I could not find a running or upcoming trip for ${context.query.trainCode}.`
    return `${context.result.train_name || context.query.trainCode} is currently ${context.result.trip_status || 'listed'} with ${Number(context.result.current_delay_minutes || 0)} minute delay. Next station: ${context.result.next_station || 'not listed'}.`
  }

  if (context.kind === 'train_profile') {
    const train = context.result.train
    if (!train) {
      return `I could not identify that train. Try the full train name, for example: ${context.result.knownTrainNames.join(', ')}.`
    }
    return trainProfileAnswer(message, train)
  }

  const upcoming = context.result.slice(0, 5)
  const lines = upcoming.map((trip) => `${trip.train_name} ${trip.train_code}: ${trip.source_station} to ${trip.destination_station}, ${formatTime(trip.scheduled_departure)}`)
  return `Here are the next upcoming trips from FERROVIA data: ${lines.join('; ')}. Ask with source and destination, for example "Dhaka to Chattogram tomorrow".`
}

export async function askAssistant(payload = {}) {
  const message = String(payload.message || '').trim()
  if (!message) throw badRequest('message is required')
  if (message.length > 1000) throw badRequest('message must be 1000 characters or fewer')

  return { message: await directReply(message), mode: 'database' }
}
