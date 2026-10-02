import RouteSection from './admin/RouteSection'
import BasicSection from './admin/BasicSection'
import TrainsetsSection from './admin/TrainsetsSection'
import FaresSection from './admin/FaresSection'
import CoachesSection from './admin/CoachesSection'
import {
  useEffect,
  useState
} from 'react'

import { api } from '../lib/api'

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
            Train management
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

      <nav className="service-index" aria-label="Service sections">{[['basic', 'Basics'], ['up', 'Up route'], ['down', 'Down route'], ['trainsets', 'Trainsets'], ['fares', 'Fares'], ['coaches', 'Coaches']].map(([id, label]) => <button key={id} type="button" onClick={() => document.getElementById(`service-${id}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}>{label}</button>)}</nav>
      <BasicSection form={form} setForm={setForm} />

      <RouteSection form={form} direction="up" label="UP" stations={stations} setRouteField={setRouteField} copyUpReverse={copyUpReverse} toggleDay={toggleDay} addStop={addStop} updateStop={updateStop} removeStop={removeStop} />
      <RouteSection form={form} direction="down" label="DOWN" stations={stations} setRouteField={setRouteField} copyUpReverse={copyUpReverse} toggleDay={toggleDay} addStop={addStop} updateStop={updateStop} removeStop={removeStop} />

      <TrainsetsSection addTrainset={addTrainset} removeTrainset={removeTrainset} form={form} stations={stations} updateTrainset={updateTrainset} />

      <FaresSection form={form} classes={classes} addFare={addFare} updateFare={updateFare} removeFare={removeFare} />

      <CoachesSection form={form} classes={classes} addCoach={addCoach} updateCoach={updateCoach} removeCoach={removeCoach} />

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