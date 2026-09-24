import { useCallback, useEffect, useMemo, useState } from 'react'
import DatePicker from './DatePicker'
import { Icon } from './Icons'
import { api } from '../lib/api'

const pad = n => String(n).padStart(2, '0')
const localToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const fmtTime = value => value
  ? new Date(value).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })
  : '-'
const fmtDate = value => value
  ? new Date(value).toLocaleDateString('en-BD', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  : '-'
const delayText = value => Number(value) > 0 ? `${value} min late` : 'On time'

export default function AdminAssignTrip({ user, handleError, setToast }) {
  const [trainsets, setTrainsets] = useState([])
  const [operators, setOperators] = useState([])
  const [trips, setTrips] = useState([])
  const [date, setDate] = useState(localToday())
  const [loading, setLoading] = useState(false)
  const [assigningTripId, setAssigningTripId] = useState(null)
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [trainSearch, setTrainSearch] = useState('')
  const [assigningTrainsetId, setAssigningTrainsetId] = useState(null)
  const allowed = user?.role === 'ADMIN'

  const reload = useCallback(async () => {
    if (!allowed) return
    setLoading(true)
    try {
      const [operatorRows, tripRows] = await Promise.all([
        api('/admin/operators'),
        api(`/admin/trips?date=${date}`),
      ])
      setOperators(operatorRows)
      setTrips(tripRows)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [allowed, date, handleError])

  useEffect(() => {
    reload()
  }, [reload])

  const selectedTrip = trips.find(trip => trip.trip_id === selectedTripId) || null

  useEffect(() => {
    if (!trips.length) {
      setSelectedTripId(null)
      return
    }
    if (!trips.some(trip => trip.trip_id === selectedTripId)) {
      const assignable = trips.find(trip =>
        ['SCHEDULED', 'BOARDING'].includes(trip.trip_status)
      )
      setSelectedTripId((assignable || trips[0]).trip_id)
    }
  }, [trips, selectedTripId])

  useEffect(() => {
    if (!selectedTrip?.train_id) {
      setTrainsets([])
      return
    }
    let active = true
    api(`/admin/trainsets?trainId=${selectedTrip.train_id}`)
      .then(rows => {
        if (active) setTrainsets(rows)
      })
      .catch(handleError)
    return () => {
      active = false
    }
  }, [selectedTrip?.train_id, handleError])

  const searchedTrips = useMemo(() => {
    const query = trainSearch.trim().toLowerCase()
    if (!query) return []
    return trips.filter(trip =>
      `${trip.train_name} ${trip.train_code} ${trip.trip_id} ${trip.source_station} ${trip.destination_station}`
        .toLowerCase()
        .includes(query)
    ).slice(0, 8)
  }, [trainSearch, trips])

  const availableTrainsets = trainsets.filter(trainset => {
    if (Number(trainset.trainset_id) === Number(selectedTrip?.assigned_trainset_id)) return true
    if (String(trainset.status).toUpperCase() !== 'SPARE') return false
    return !trainset.current_station_id ||
      Number(trainset.current_station_id) === Number(selectedTrip?.source_station_id)
  })

  const assignOperator = async (tripId, operatorUserId) => {
    setAssigningTripId(tripId)
    try {
      await api(`/admin/trips/${tripId}/operator`, {
        method: 'PATCH',
        body: { operatorUserId: Number(operatorUserId) },
      })
      setToast(`Operator assigned to trip #${tripId}`)
      await reload()
    } catch (error) {
      handleError(error)
    } finally {
      setAssigningTripId(null)
    }
  }

  const assignTrainset = async trainset => {
    if (!selectedTrip) return
    setAssigningTrainsetId(trainset.trainset_id)
    try {
      await api(`/admin/trips/${selectedTrip.trip_id}/trainset`, {
        method: 'PATCH',
        body: { trainsetId: trainset.trainset_id },
      })
      setToast(`${trainset.trainset_code} assigned to trip #${selectedTrip.trip_id}`)
      const [, refreshedTrainsets] = await Promise.all([
        reload(),
        api(`/admin/trainsets?trainId=${selectedTrip.train_id}`),
      ])
      setTrainsets(refreshedTrainsets)
    } catch (error) {
      handleError(error)
    } finally {
      setAssigningTrainsetId(null)
    }
  }

  if (!allowed) {
    return (
      <main className="page">
        <div className="empty card access-card">
          <Icon name="shield" size={44} />
          <h2>Admin access required</h2>
          <p>Trip and trainset assignment is restricted to ADMIN accounts.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="page-title">
        <span className="eyebrow">ADMIN / OPERATIONS</span>
        <h1>Trip assignments</h1>
        <p>Select an issued trip, reserve an available physical trainset, and assign its operator.</p>
      </div>

      <section className="admin-grid assignment-workspace">
        <section className="card issued-trip-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">ISSUED TRIPS</span>
              <h2>Select a trip</h2>
            </div>
            <button className="secondary compact" onClick={reload} disabled={loading}>Refresh</button>
          </div>
          <div className="issued-trip-list">
            {trips.map(trip => (
              <button
                type="button"
                className={trip.trip_id === selectedTripId ? 'selected' : ''}
                key={trip.trip_id}
                onClick={() => setSelectedTripId(trip.trip_id)}
              >
                <span>
                  <b>{trip.train_name}</b>
                  <small>#{trip.trip_id} · {trip.train_code}</small>
                </span>
                <span>
                  <b>{fmtTime(trip.scheduled_departure)}</b>
                  <small>{trip.source_station} → {trip.destination_station}</small>
                </span>
                <strong>{trip.trip_status}</strong>
              </button>
            ))}
            {!trips.length && <p className="empty-inline">No issued trips for {date}.</p>}
          </div>
        </section>

        <section className="card fleet-card trainset-assignment-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">TRAINSET ASSIGNMENT</span>
              <h2>Assign a physical trainset</h2>
            </div>
          </div>
          <label className="admin-train-search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={trainSearch}
              onChange={event => setTrainSearch(event.target.value)}
              placeholder="Search issued train, code or trip ID"
            />
          </label>

          {trainSearch && (
            <div className="admin-train-results">
              {searchedTrips.map(trip => (
                <button
                  type="button"
                  key={trip.trip_id}
                  onClick={() => {
                    setSelectedTripId(trip.trip_id)
                    setTrainSearch('')
                  }}
                >
                  <b>{trip.train_name}</b>
                  <span>#{trip.trip_id} · {trip.train_code}</span>
                  <small>{trip.source_station} → {trip.destination_station}</small>
                </button>
              ))}
              {!searchedTrips.length && <p>No issued trains found.</p>}
            </div>
          )}

          {selectedTrip && (
            <div className="selected-trip-summary">
              <div>
                <span>Selected trip</span>
                <b>{selectedTrip.train_name} · #{selectedTrip.trip_id}</b>
                <small>{selectedTrip.source_station} → {selectedTrip.destination_station}</small>
              </div>
              <strong>{selectedTrip.assigned_trainset_code || 'No trainset assigned'}</strong>
            </div>
          )}

          <div className="fleet-list assignable-fleet-list">
            {availableTrainsets.map(trainset => {
              const assigned = Number(trainset.trainset_id) ===
                Number(selectedTrip?.assigned_trainset_id)
              return (
                <article key={trainset.trainset_id}>
                  <span className={`fleet-dot ${String(trainset.status).toLowerCase()}`}></span>
                  <div>
                    <b>{trainset.trainset_code}</b>
                    <small>{trainset.train_name}</small>
                  </div>
                  <strong>{trainset.status}</strong>
                  <span>{trainset.current_station || 'Location not set'}</span>
                  <button
                    type="button"
                    disabled={assigned || assigningTrainsetId !== null}
                    onClick={() => assignTrainset(trainset)}
                  >
                    {assigningTrainsetId === trainset.trainset_id
                      ? 'Assigning...'
                      : assigned ? 'Assigned' : 'Assign trainset'}
                  </button>
                </article>
              )
            })}
            {selectedTrip && !availableTrainsets.length && (
              <p className="empty-inline">
                No spare trainsets for {selectedTrip.train_name} are available at {selectedTrip.source_station}.
              </p>
            )}
            {!selectedTrip && <p className="empty-inline">Select an issued trip to see available trainsets.</p>}
          </div>
        </section>
      </section>

      <section className="card admin-trips">
        <div className="section-head">
          <div>
            <span className="eyebrow">OPERATOR ASSIGNMENT</span>
            <h2>Trips & Operators</h2>
          </div>
          <DatePicker value={date} onChange={setDate} />
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
                <th>Trainset</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <AdminTripRow
                  key={trip.trip_id}
                  trip={trip}
                  operators={operators}
                  assign={assignOperator}
                  assigning={assigningTripId === trip.trip_id}
                />
              ))}
            </tbody>
          </table>
          {!trips.length && <p className="empty-inline">No trips for {date}.</p>}
        </div>
      </section>
    </main>
  )
}

function AdminTripRow({ trip, operators, assign, assigning }) {
  const [operator, setOperator] = useState(String(trip.operator_user_id || ''))

  useEffect(() => {
    setOperator(String(trip.operator_user_id || ''))
  }, [trip.operator_user_id])

  return (
    <tr>
      <td><b>#{trip.trip_id}</b><br /><small>{trip.train_name}</small></td>
      <td>{trip.direction}<br /><small>{trip.source_station} → {trip.destination_station}</small></td>
      <td>{fmtTime(trip.scheduled_departure)}<br /><small>{fmtDate(trip.scheduled_departure)}</small></td>
      <td>{trip.trip_status}<br /><small>{delayText(trip.current_delay_minutes)}</small></td>
      <td>
        <small>Last: {trip.last_left_station || '-'}<br />Next: {trip.next_station || '-'}</small>
      </td>
      <td>
        <b>{trip.assigned_trainset_code || 'Unassigned'}</b><br />
        <small>{trip.trainset_assignment_status || 'Select above'}</small>
      </td>
      <td>
        <div className="inline-assign">
          <select
            value={operator}
            onChange={event => setOperator(event.target.value)}
            disabled={assigning}
          >
            <option value="">Unassigned</option>
            {operators.map(item => (
              <option value={item.user_id} key={item.user_id}>
                {item.full_name} / ID #{item.user_id}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!operator || assigning}
            onClick={() => assign(trip.trip_id, operator)}
          >
            {assigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </td>
    </tr>
  )
}
