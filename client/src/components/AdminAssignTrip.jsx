import { useCallback, useEffect, useState } from 'react'
import DatePicker from './DatePicker'
import { Icon } from './Icons'
import { api } from '../lib/api'


const pad = n => String(n).padStart(2, '0')

const localToday = () => {
  const d = new Date()

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const fmtTime = v =>
  v
    ? new Date(v).toLocaleTimeString('en-BD', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const fmtDate = v =>
  v
    ? new Date(v).toLocaleDateString('en-BD', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—'

const delayText = n =>
  Number(n) > 0
    ? `${n} min late`
    : 'On time'


export default function AdminAssignTrip({
  user,
  handleError,
  setToast
}) {

  const [routes, setRoutes] = useState([])
  const [trainsets, setTrainsets] = useState([])
  const [operators, setOperators] = useState([])
  const [trips, setTrips] = useState([])

  const [date, setDate] = useState(localToday())

  const [form, setForm] = useState({
    routeId: '',
    scheduledDeparture: '',
    operatorUserId: '',
    trainsetId: '',
  })

  const [loading, setLoading] = useState(false)

  const allowed = user?.role === 'ADMIN'


  const reload = useCallback(async () => {

    if (!allowed) return

    setLoading(true)

    try {

      const [r, ts, op, tr] = await Promise.all([
        api('/admin/routes'),
        api('/admin/trainsets'),
        api('/admin/operators'),
        api(`/admin/trips?date=${date}`),
      ])

      setRoutes(r)
      setTrainsets(ts)
      setOperators(op)
      setTrips(tr)

      setForm(f => ({
        ...f,

        routeId:
          f.routeId ||
          String(r[0]?.route_id || ''),

        operatorUserId:
          f.operatorUserId ||
          String(op[0]?.user_id || ''),
      }))

    } catch (err) {

      handleError(err)

    } finally {

      setLoading(false)

    }

  }, [allowed, date, handleError])


  useEffect(() => {
    reload()
  }, [reload])


  if (!allowed) {
    return (
      <main className="page">

        <div className="empty card access-card">

          <Icon
            name="shield"
            size={44}
          />

          <h2>Admin access required</h2>

          <p>
            Trip creation and operator assignment
            are restricted to ADMIN accounts.
          </p>

        </div>

      </main>
    )
  }


  const route = routes.find(
    r =>
      Number(r.route_id) ===
      Number(form.routeId)
  )


  const eligible = trainsets.filter(
    t =>
      Number(t.train_id) ===
        Number(route?.train_id) &&

      t.status === 'SPARE' &&

      Number(t.current_station_id) ===
        Number(route?.source_station_id)
  )


  const createTrip = async e => {

    e.preventDefault()

    if (!form.scheduledDeparture) {

      setToast(
        'Choose a departure date and time'
      )

      return
    }

    setLoading(true)

    try {

      const data = await api(
        '/admin/trips',
        {
          method: 'POST',

          body: {

            routeId:
              Number(form.routeId),

            scheduledDeparture:
              new Date(
                form.scheduledDeparture
              ).toISOString(),

            operatorUserId:
              form.operatorUserId
                ? Number(form.operatorUserId)
                : null,

            trainsetId:
              form.trainsetId
                ? Number(form.trainsetId)
                : null,
          }
        }
      )

      setToast(
        `Trip #${data.trip_id} created with stops and seat inventory`
      )

      setForm(f => ({
        ...f,
        scheduledDeparture: '',
        trainsetId: '',
      }))

      await reload()

    } catch (err) {

      handleError(err)

    } finally {

      setLoading(false)

    }
  }


  const assign = async (
    tripId,
    operatorUserId
  ) => {

    try {

      await api(
        `/admin/trips/${tripId}/operator`,
        {
          method: 'PATCH',

          body: {
            operatorUserId:
              Number(operatorUserId),
          }
        }
      )

      setToast(
        `Operator assigned to trip #${tripId}`
      )

      await reload()

    } catch (err) {

      handleError(err)

    }
  }


  return (
    <main className="page">

      <div className="page-title">

        <span className="eyebrow">
          ADMIN • OPERATIONS
        </span>

        <h1>
          Assign Trip Operator
        </h1>

        <p>
          Create dated railway trips,
          assign active operators and
          monitor physical trainset availability.
        </p>

      </div>


      <section className="admin-grid">


        {/* =========================
            CREATE TRIP
        ========================== */}

        <form
          className="card admin-create"
          onSubmit={createTrip}
        >

          <span className="eyebrow">
            DATED OPERATION
          </span>

          <h2>Create Trip</h2>


          <label>

            Route

            <select
              value={form.routeId}

              onChange={e =>
                setForm({
                  ...form,
                  routeId:
                    e.target.value,
                  trainsetId: '',
                })
              }
            >

              {routes.map(r => (

                <option
                  key={r.route_id}
                  value={r.route_id}
                >

                  {r.train_name}
                  {' • '}
                  {r.direction}
                  {' • '}
                  {r.source_station}
                  {' → '}
                  {r.destination_station}

                </option>

              ))}

            </select>

          </label>


          <label>

            Scheduled departure

            <input
              type="datetime-local"

              value={
                form.scheduledDeparture
              }

              onChange={e =>
                setForm({
                  ...form,
                  scheduledDeparture:
                    e.target.value,
                })
              }
            />

          </label>


          <label>

            Operator

            <select
              value={
                form.operatorUserId
              }

              onChange={e =>
                setForm({
                  ...form,
                  operatorUserId:
                    e.target.value,
                })
              }
            >

              <option value="">
                Unassigned
              </option>

              {operators.map(o => (

                <option
                  value={o.user_id}
                  key={o.user_id}
                >

                  {o.full_name}
                  {' • '}
                  Operator ID #{o.user_id}

                </option>

              ))}

            </select>

          </label>


          <label>

            Initial physical trainset

            <select
              value={
                form.trainsetId
              }

              onChange={e =>
                setForm({
                  ...form,
                  trainsetId:
                    e.target.value,
                })
              }
            >

              <option value="">
                Create without initial assignment
              </option>

              {eligible.map(t => (

                <option
                  value={t.trainset_id}
                  key={t.trainset_id}
                >

                  {t.trainset_code}
                  {' • '}
                  SPARE at
                  {' '}
                  {t.current_station}

                </option>

              ))}

            </select>

          </label>


          <button
            className="primary"
            disabled={loading}
          >
            Create Trip
          </button>


          <small>
            Only SPARE trainsets standing
            at the selected route source
            terminal are eligible.
          </small>

        </form>


        {/* =========================
            PHYSICAL FLEET
        ========================== */}

        <section className="card fleet-card">

          <div className="section-head">

            <div>

              <span className="eyebrow">
                PHYSICAL FLEET
              </span>

              <h2>
                Trainset Availability
              </h2>

            </div>


            <button
              className="secondary"
              onClick={reload}
            >
              Refresh
            </button>

          </div>


          <div className="fleet-list">

            {trainsets.map(t => (

              <article
                key={t.trainset_id}
              >

                <span
                  className={
                    `fleet-dot ${
                      String(
                        t.status
                      ).toLowerCase()
                    }`
                  }
                >
                </span>


                <div>

                  <b>
                    {t.trainset_code}
                  </b>

                  <small>
                    {t.train_name}
                  </small>

                </div>


                <strong>
                  {t.status}
                </strong>


                <span>
                  {
                    t.current_station ||
                    'Running / no terminal'
                  }
                </span>

              </article>

            ))}

          </div>

        </section>

      </section>


      {/* =========================
          TRIPS + OPERATOR ASSIGNMENT
      ========================== */}

      <section className="card admin-trips">

        <div className="section-head">

          <div>

            <span className="eyebrow">
              OPERATOR ASSIGNMENT
            </span>

            <h2>
              Trips & Operators
            </h2>

          </div>


          <DatePicker
            value={date}
            onChange={setDate}
          />

        </div>


        <div className="admin-table-wrap">

          <table>

            <thead>

              <tr>

                <th>Trip</th>

                <th>Route</th>

                <th>Time</th>

                <th>Status</th>

                <th>Train status</th>

                <th>Operator</th>

              </tr>

            </thead>


            <tbody>

              {trips.map(t => (

                <AdminTripRow
                  key={t.trip_id}
                  trip={t}
                  operators={operators}
                  assign={assign}
                />

              ))}

            </tbody>

          </table>


          {!trips.length &&
            <p className="empty-inline">
              No trips for {date}.
            </p>
          }

        </div>

      </section>

    </main>
  )
}



function AdminTripRow({
  trip,
  operators,
  assign
}) {

  const [operator, setOperator] =
    useState(
      String(
        trip.operator_user_id || ''
      )
    )


  return (

    <tr>

      <td>

        <b>
          #{trip.trip_id}
        </b>

        <br />

        <small>
          {trip.train_name}
        </small>

      </td>


      <td>

        {trip.direction}

        <br />

        <small>

          {trip.source_station}
          {' → '}
          {trip.destination_station}

        </small>

      </td>


      <td>

        {fmtTime(
          trip.scheduled_departure
        )}

        <br />

        <small>

          {fmtDate(
            trip.scheduled_departure
          )}

        </small>

      </td>


      <td>

        {trip.trip_status}

        <br />

        <small>
          {delayText(
            trip.current_delay_minutes
          )}
        </small>

      </td>


      <td>

        <small>

          Last:
          {' '}
          {trip.last_left_station || '—'}

          <br />

          Next:
          {' '}
          {trip.next_station || '—'}

        </small>

      </td>


      <td>

        <div className="inline-assign">

          <select
            value={operator}

            onChange={e =>
              setOperator(
                e.target.value
              )
            }
          >

            <option value="">
              Unassigned
            </option>

            {operators.map(o => (

              <option
                value={o.user_id}
                key={o.user_id}
              >

                {o.full_name}
                {' • '}
                ID #{o.user_id}

              </option>

            ))}

          </select>


          <button
            disabled={!operator}

            onClick={() =>
              assign(
                trip.trip_id,
                operator
              )
            }
          >
            Assign
          </button>

        </div>

      </td>

    </tr>

  )
}