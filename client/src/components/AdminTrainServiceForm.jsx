import {
  useEffect,
  useState
} from 'react'

import { api } from '../lib/api'

const DAYS = [
  'SAT',
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI'
]

const blankStop = () => ({
  stationId: '',
  arrivalTime: '',
  departureTime: '',
  distanceKm: ''
})

const blankRoute = () => ({
  trainNumber: '',
  routeCode: '',
  sourceStationId: '',
  destinationStationId: '',
  departureTime: '',
  runningDays: [],
  stops: [
    blankStop(),
    blankStop()
  ]
})

const initialForm = () => ({
  trainName: '',
  trainCode: '',
  trainType: 'INTERCITY',
  trainStatus: 'ACTIVE',
  spareTriggerDelayMin: 60,

  routes: {
    up: blankRoute(),
    down: blankRoute()
  },

  trainsets: [
    {
      trainsetCode: '',
      status: 'SPARE',
      currentStationId: ''
    },
    {
      trainsetCode: '',
      status: 'SPARE',
      currentStationId: ''
    },
    {
      trainsetCode: '',
      status: 'SPARE',
      currentStationId: ''
    }
  ],

  fares: [
    {
      classId: '',
      baseFare: '',
      ratePerKm: ''
    }
  ],

  coaches: [
    {
      coachCode: '',
      classId: '',
      seatCount: '',
      seatType: 'REGULAR'
    }
  ]
})

export default function AdminTrainServiceForm({
  handleError,
  setToast,
  onCreated
}) {
  const [form, setForm] =
    useState(initialForm)

  const [stations, setStations] =
    useState([])

  const [classes, setClasses] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    async function loadOptions() {
      try {
        const data =
          await api('/admin/train-form-options')

        setStations(data.stations || [])
        setClasses(data.classes || [])
      } catch (error) {
        handleError(error)
      }
    }

    loadOptions()
  }, [handleError])

  const setRouteField =
    (direction, field, value) => {
      setForm(previous => {
        const route = {
          ...previous.routes[direction],
          [field]: value
        }

        const stops =
          route.stops.map(stop => ({ ...stop }))

        if (
          field === 'sourceStationId' &&
          stops.length
        ) {
          stops[0].stationId = value
        }

        if (
          field === 'destinationStationId' &&
          stops.length
        ) {
          stops[stops.length - 1].stationId =
            value
        }

        if (
          field === 'departureTime' &&
          stops.length
        ) {
          stops[0].departureTime = value
          stops[0].arrivalTime = ''
        }

        route.stops = stops

        return {
          ...previous,
          routes: {
            ...previous.routes,
            [direction]: route
          }
        }
      })
    }

  const toggleDay =
    (direction, day) => {
      setForm(previous => {
        const route =
          previous.routes[direction]

        const runningDays =
          route.runningDays.includes(day)
            ? route.runningDays.filter(
                item => item !== day
              )
            : [...route.runningDays, day]

        return {
          ...previous,
          routes: {
            ...previous.routes,
            [direction]: {
              ...route,
              runningDays
            }
          }
        }
      })
    }

  const updateStop =
    (direction, index, field, value) => {
      setForm(previous => {
        const route =
          previous.routes[direction]

        const stops =
          route.stops.map((stop, i) =>
            i === index
              ? { ...stop, [field]: value }
              : stop
          )

        return {
          ...previous,
          routes: {
            ...previous.routes,
            [direction]: {
              ...route,
              stops
            }
          }
        }
      })
    }

  const addStop =
    direction => {
      setForm(previous => {
        const route =
          previous.routes[direction]

        const stops =
          [...route.stops]

        stops.splice(
          Math.max(1, stops.length - 1),
          0,
          blankStop()
        )

        return {
          ...previous,
          routes: {
            ...previous.routes,
            [direction]: {
              ...route,
              stops
            }
          }
        }
      })
    }

  const removeStop =
    (direction, index) => {
      setForm(previous => {
        const route =
          previous.routes[direction]

        if (
          index === 0 ||
          index === route.stops.length - 1
        ) {
          return previous
        }

        return {
          ...previous,
          routes: {
            ...previous.routes,
            [direction]: {
              ...route,
              stops:
                route.stops.filter(
                  (_, i) => i !== index
                )
            }
          }
        }
      })
    }

  const copyUpReverse = () => {
    setForm(previous => {
      const up = previous.routes.up

      const lastDistance =
        Number(
          up.stops[
            up.stops.length - 1
          ]?.distanceKm
        )

      const reversedStops =
        [...up.stops]
          .reverse()
          .map(stop => ({
            stationId: stop.stationId,
            arrivalTime: '',
            departureTime: '',
            distanceKm:
              Number.isFinite(lastDistance) &&
              stop.distanceKm !== ''
                ? String(
                    Math.max(
                      0,
                      lastDistance -
                        Number(stop.distanceKm)
                    )
                  )
                : ''
          }))

      return {
        ...previous,
        routes: {
          ...previous.routes,
          down: {
            ...previous.routes.down,
            sourceStationId:
              up.destinationStationId,
            destinationStationId:
              up.sourceStationId,
            stops: reversedStops
          }
        }
      }
    })

    setToast(
      'UP station sequence copied in reverse. Enter DOWN times separately.'
    )
  }

  const updateTrainset =
    (index, field, value) => {
      setForm(previous => ({
        ...previous,
        trainsets:
          previous.trainsets.map(
            (item, i) =>
              i === index
                ? {
                    ...item,
                    [field]: value
                  }
                : item
          )
      }))
    }

  const addTrainset = () => {
    setForm(previous => ({
      ...previous,
      trainsets: [
        ...previous.trainsets,
        {
          trainsetCode: '',
          status: 'SPARE',
          currentStationId: ''
        }
      ]
    }))
  }

  const removeTrainset = index => {
    setForm(previous => {
      if (previous.trainsets.length <= 3) {
        setToast(
          'At least 3 trainsets are required'
        )

        return previous
      }

      return {
        ...previous,
        trainsets:
          previous.trainsets.filter(
            (_, i) => i !== index
          )
      }
    })
  }

  const updateFare =
    (index, field, value) => {
      setForm(previous => ({
        ...previous,
        fares:
          previous.fares.map(
            (item, i) =>
              i === index
                ? {
                    ...item,
                    [field]: value
                  }
                : item
          )
      }))
    }

  const addFare = () => {
    setForm(previous => ({
      ...previous,
      fares: [
        ...previous.fares,
        {
          classId: '',
          baseFare: '',
          ratePerKm: ''
        }
      ]
    }))
  }

  const removeFare = index => {
    setForm(previous => ({
      ...previous,
      fares:
        previous.fares.filter(
          (_, i) => i !== index
        )
    }))
  }

  const updateCoach =
    (index, field, value) => {
      setForm(previous => ({
        ...previous,
        coaches:
          previous.coaches.map(
            (item, i) =>
              i === index
                ? {
                    ...item,
                    [field]: value
                  }
                : item
          )
      }))
    }

  const addCoach = () => {
    setForm(previous => ({
      ...previous,
      coaches: [
        ...previous.coaches,
        {
          coachCode: '',
          classId: '',
          seatCount: '',
          seatType: 'REGULAR'
        }
      ]
    }))
  }

  const removeCoach = index => {
    setForm(previous => ({
      ...previous,
      coaches:
        previous.coaches.filter(
          (_, i) => i !== index
        )
    }))
  }

  const renderRoute =
    (direction, label) => {
      const route =
        form.routes[direction]

      return (
        <section className="admin-train-section">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                {label} ROUTE
              </span>

              <h3>
                {label} direction timetable
              </h3>
            </div>

            {direction === 'down' &&
              <button
                type="button"
                className="secondary"
                onClick={copyUpReverse}
              >
                Copy UP stops in reverse
              </button>
            }
          </div>

          <div className="admin-train-grid">
            <label>
              Train number
              <input
                required
                placeholder={
                  direction === 'up'
                    ? '701'
                    : '702'
                }
                value={route.trainNumber}
                onChange={event =>
                  setRouteField(
                    direction,
                    'trainNumber',
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Route code
              <input
                required
                placeholder={
                  direction === 'up'
                    ? 'SUB-UP'
                    : 'SUB-DOWN'
                }
                value={route.routeCode}
                onChange={event =>
                  setRouteField(
                    direction,
                    'routeCode',
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Source station
              <select
                required
                value={
                  route.sourceStationId
                }
                onChange={event =>
                  setRouteField(
                    direction,
                    'sourceStationId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select station
                </option>

                {stations.map(station =>
                  <option
                    key={station.station_id}
                    value={station.station_id}
                  >
                    {station.station_name}
                  </option>
                )}
              </select>
            </label>

            <label>
              Destination station
              <select
                required
                value={
                  route.destinationStationId
                }
                onChange={event =>
                  setRouteField(
                    direction,
                    'destinationStationId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select station
                </option>

                {stations.map(station =>
                  <option
                    key={station.station_id}
                    value={station.station_id}
                  >
                    {station.station_name}
                  </option>
                )}
              </select>
            </label>

            <label>
              Route departure
              <input
                required
                type="time"
                value={route.departureTime}
                onChange={event =>
                  setRouteField(
                    direction,
                    'departureTime',
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <div className="admin-days">
            <b>Running days</b>

            <div>
              {DAYS.map(day =>
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={
                      route.runningDays.includes(
                        day
                      )
                    }
                    onChange={() =>
                      toggleDay(
                        direction,
                        day
                      )
                    }
                  />

                  {day}
                </label>
              )}
            </div>
          </div>

          <div className="admin-stop-editor">
            <div className="admin-stop-head">
              <b>Stopping sequence</b>

              <button
                type="button"
                className="secondary"
                onClick={() =>
                  addStop(direction)
                }
              >
                + Add stop
              </button>
            </div>

            {route.stops.map(
              (stop, index) =>
                <div
                  className="admin-stop-row"
                  key={index}
                >
                  <strong>
                    {index + 1}
                  </strong>

                  <select
                    required
                    value={stop.stationId}
                    onChange={event =>
                      updateStop(
                        direction,
                        index,
                        'stationId',
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Station
                    </option>

                    {stations.map(station =>
                      <option
                        value={
                          station.station_id
                        }
                        key={
                          station.station_id
                        }
                      >
                        {station.station_name}
                      </option>
                    )}
                  </select>

                  <label>
                    Arrival
                    <input
                      type="time"
                      disabled={index === 0}
                      value={stop.arrivalTime}
                      onChange={event =>
                        updateStop(
                          direction,
                          index,
                          'arrivalTime',
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Departure
                    <input
                      type="time"
                      disabled={
                        index ===
                        route.stops.length - 1
                      }
                      value={
                        index === 0
                          ? route.departureTime
                          : stop.departureTime
                      }
                      onChange={event =>
                        updateStop(
                          direction,
                          index,
                          'departureTime',
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Distance km
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={stop.distanceKm}
                      onChange={event =>
                        updateStop(
                          direction,
                          index,
                          'distanceKm',
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-remove"
                    disabled={
                      index === 0 ||
                      index ===
                        route.stops.length - 1
                    }
                    onClick={() =>
                      removeStop(
                        direction,
                        index
                      )
                    }
                  >
                    ×
                  </button>
                </div>
            )}
          </div>
        </section>
      )
    }

  const submit = async event => {
    event.preventDefault()

    setLoading(true)

    try {
      const payload = {
        train: {
          trainName: form.trainName,
          trainCode: form.trainCode,
          trainType: form.trainType,
          trainStatus:
            form.trainStatus,
          spareTriggerDelayMin:
            Number(
              form.spareTriggerDelayMin
            )
        },

        routes: {
          up: form.routes.up,
          down: form.routes.down
        },

        trainsets:
          form.trainsets.map(item => ({
            ...item,
            currentStationId:
              Number(
                item.currentStationId
              )
          })),

        fares:
          form.fares.map(item => ({
            classId:
              Number(item.classId),
            baseFare:
              Number(item.baseFare || 0),
            ratePerKm:
              Number(item.ratePerKm)
          })),

        coaches:
          form.coaches.map(item => ({
            coachCode:
              item.coachCode,
            classId:
              Number(item.classId),
            seatCount:
              Number(item.seatCount),
            seatType:
              item.seatType
          }))
      }

      const data =
        await api(
          '/admin/train-services',
          {
            method: 'POST',
            body: payload
          }
        )

      setToast(
        `${data.train_name || form.trainName} created: ${data.coach_count} coaches, ${data.seat_count} seats`
      )

      setForm(initialForm())

      if (onCreated) {
        await onCreated()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="card admin-train-service"
      onSubmit={submit}
    >
      <div className="section-head">
        <div>
          <span className="eyebrow">
            TRAIN MANAGEMENT
          </span>

          <h2>Add train service</h2>

          <p>
            Create the permanent train,
            UP/DOWN routes, stops,
            weekly schedule, physical
            trainsets, fares, coaches
            and seats.
          </p>
        </div>
      </div>

      <section className="admin-train-section">
        <h3>Basic information</h3>

        <div className="admin-train-grid">
          <label>
            Train name
            <input
              required
              placeholder="Suborno Express"
              value={form.trainName}
              onChange={event =>
                setForm({
                  ...form,
                  trainName:
                    event.target.value
                })
              }
            />
          </label>

          <label>
            Service code
            <input
              required
              placeholder="SUBORNO"
              value={form.trainCode}
              onChange={event =>
                setForm({
                  ...form,
                  trainCode:
                    event.target.value
                })
              }
            />
          </label>

          <label>
            Train type
            <select
              value={form.trainType}
              onChange={event =>
                setForm({
                  ...form,
                  trainType:
                    event.target.value
                })
              }
            >
              <option value="INTERCITY">
                Intercity
              </option>

              <option value="MAIL">
                Mail
              </option>

              <option value="LOCAL">
                Local
              </option>

              <option value="COMMUTER">
                Commuter
              </option>

              <option value="MIXED">
                Mixed
              </option>

              <option value="SHUTTLE">
                Shuttle
              </option>
            </select>
          </label>

          <label>
            Status
            <select
              value={form.trainStatus}
              onChange={event =>
                setForm({
                  ...form,
                  trainStatus:
                    event.target.value
                })
              }
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </label>

          <label>
            Spare trigger delay
            <input
              type="number"
              min="0"
              required
              value={
                form.spareTriggerDelayMin
              }
              onChange={event =>
                setForm({
                  ...form,
                  spareTriggerDelayMin:
                    event.target.value
                })
              }
            />
          </label>
        </div>
      </section>

      {renderRoute('up', 'UP')}
      {renderRoute('down', 'DOWN')}

      <section className="admin-train-section">
        <div className="admin-stop-head">
          <div>
            <span className="eyebrow">
              PHYSICAL FLEET
            </span>

            <h3>Trainsets</h3>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={addTrainset}
          >
            + Add trainset
          </button>
        </div>

        {form.trainsets.map(
          (item, index) =>
            <div
              className="admin-repeat-row"
              key={index}
            >
              <input
                required
                placeholder={`Trainset code ${
                  index + 1
                }`}
                value={
                  item.trainsetCode
                }
                onChange={event =>
                  updateTrainset(
                    index,
                    'trainsetCode',
                    event.target.value
                  )
                }
              />

              <select
                value={item.status}
                onChange={event =>
                  updateTrainset(
                    index,
                    'status',
                    event.target.value
                  )
                }
              >
                <option value="SPARE">
                  SPARE
                </option>

                <option value="MAINTENANCE">
                  MAINTENANCE
                </option>

                <option value="OUT_OF_SERVICE">
                  OUT OF SERVICE
                </option>
              </select>

              <select
                required
                value={
                  item.currentStationId
                }
                onChange={event =>
                  updateTrainset(
                    index,
                    'currentStationId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Initial terminal
                </option>

                {[
                  form.routes.up
                    .sourceStationId,
                  form.routes.up
                    .destinationStationId
                ]
                  .filter(Boolean)
                  .map(id => {
                    const station =
                      stations.find(
                        item =>
                          Number(
                            item.station_id
                          ) === Number(id)
                      )

                    return (
                      <option
                        value={id}
                        key={id}
                      >
                        {
                          station
                            ?.station_name
                        }
                      </option>
                    )
                  })}
              </select>

              <button
                type="button"
                className="admin-remove"
                onClick={() =>
                  removeTrainset(index)
                }
              >
                ×
              </button>
            </div>
        )}
      </section>

      <section className="admin-train-section">
        <div className="admin-stop-head">
          <div>
            <span className="eyebrow">
              PRICING
            </span>

            <h3>Class fares</h3>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={addFare}
          >
            + Add fare
          </button>
        </div>

        {form.fares.map(
          (fare, index) =>
            <div
              className="admin-repeat-row"
              key={index}
            >
              <select
                required
                value={fare.classId}
                onChange={event =>
                  updateFare(
                    index,
                    'classId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Class
                </option>

                {classes.map(item =>
                  <option
                    key={item.class_id}
                    value={item.class_id}
                  >
                    {item.class_name}
                  </option>
                )}
              </select>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Base fare"
                value={fare.baseFare}
                onChange={event =>
                  updateFare(
                    index,
                    'baseFare',
                    event.target.value
                  )
                }
              />

              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Rate / km"
                value={fare.ratePerKm}
                onChange={event =>
                  updateFare(
                    index,
                    'ratePerKm',
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="admin-remove"
                disabled={
                  form.fares.length <= 1
                }
                onClick={() =>
                  removeFare(index)
                }
              >
                ×
              </button>
            </div>
        )}
      </section>

      <section className="admin-train-section">
        <div className="admin-stop-head">
          <div>
            <span className="eyebrow">
              SEAT LAYOUT
            </span>

            <h3>Coaches & seats</h3>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={addCoach}
          >
            + Add coach
          </button>
        </div>

        {form.coaches.map(
          (coach, index) =>
            <div
              className="admin-repeat-row coach-row"
              key={index}
            >
              <input
                required
                placeholder="Coach code e.g. A"
                value={
                  coach.coachCode
                }
                onChange={event =>
                  updateCoach(
                    index,
                    'coachCode',
                    event.target.value
                  )
                }
              />

              <select
                required
                value={coach.classId}
                onChange={event =>
                  updateCoach(
                    index,
                    'classId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Class
                </option>

                {classes.map(item =>
                  <option
                    key={item.class_id}
                    value={item.class_id}
                  >
                    {item.class_name}
                  </option>
                )}
              </select>

              <input
                required
                type="number"
                min="1"
                placeholder="Seat count"
                value={
                  coach.seatCount
                }
                onChange={event =>
                  updateCoach(
                    index,
                    'seatCount',
                    event.target.value
                  )
                }
              />

              <select
                value={coach.seatType}
                onChange={event =>
                  updateCoach(
                    index,
                    'seatType',
                    event.target.value
                  )
                }
              >
                <option value="REGULAR">
                  Regular
                </option>

                <option value="WINDOW">
                  Window
                </option>

                <option value="AISLE">
                  Aisle
                </option>

                <option value="MIDDLE">
                  Middle
                </option>

                <option value="BERTH">
                  Berth
                </option>
              </select>

              <button
                type="button"
                className="admin-remove"
                disabled={
                  form.coaches.length <= 1
                }
                onClick={() =>
                  removeCoach(index)
                }
              >
                ×
              </button>
            </div>
        )}
      </section>

      <button
        className="primary admin-train-submit"
        disabled={loading}
      >
        {loading
          ? 'Creating train service…'
          : 'Create complete train service'}
      </button>
    </form>
  )
}