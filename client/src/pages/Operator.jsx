import { useCallback, useEffect, useRef, useState } from 'react'
import DatePicker from '../components/DatePicker'
import { Icon } from '../components/Icons'
import { Button } from '../components/ui/Button'
import { DelayBadge, EmptyState, SkeletonRows, StatusBadge } from '../components/ui/Feedback'
import { PageHeader, StatCard } from '../components/ui/Layout'
import { StopTimeline } from '../components/ui/Rail'
import { api } from '../lib/api'
import { useConfirm } from '../lib/confirm'
import { delayText, fmtTime, localToday } from '../lib/format'
import AccessCard from '../components/AccessCard'

export default function OperatorPanel({ user, handleError, setToast }) {
  const [date, setDate] = useState(localToday())
  const [trips, setTrips] = useState([])
  const [selected, setSelected] = useState(null)
  const [ops, setOps] = useState(null)
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(null)
  const [now, setNow] = useState(Date.now())
  const confirm = useConfirm()
  const requestId = useRef(0)
  useEffect(() => {
    requestId.current += 1
    setSelected(null); setOps(null); setTrips([])
  }, [date])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const allowed = user?.role === 'OPERATOR'
  const loadTrips = useCallback(async () => {
    if (!allowed) return
    setLoading(true)
    try {
      const data = await api(`/operator/trips?date=${date}`)
      setTrips(data)
      if (selected && !data.some((t) => Number(t.trip_id) === Number(selected))) { setSelected(null); setOps(null) }
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [allowed, date, selected, handleError])
  useEffect(() => { loadTrips() }, [loadTrips])

  const open = async (id) => {
    const request = ++requestId.current
    setSelected(id)
    setOps(null)
    setLoading(true)
    try {
      const next = await api(`/operator/trips/${id}`)
      if (request === requestId.current) setOps(next)
    } catch (err) { if (request === requestId.current) handleError(err) } finally { if (request === requestId.current) setLoading(false) }
  }

  const mark = async (stop, action) => {
    const clock = fmtTime(new Date())
    const ok = await confirm({
      tone: action === 'depart' ? 'warning' : 'primary',
      icon: action === 'depart' ? 'train' : 'checkCircle',
      title: action === 'depart' ? `Record departure from ${stop.station_name}?` : `Record arrival at ${stop.station_name}?`,
      description: `This logs the ${action === 'depart' ? 'departure' : 'arrival'} at ${clock} for trip #${selected}. Passengers tracking this train will see it straight away.`,
      confirmLabel: action === 'depart' ? 'Record departure' : 'Record arrival',
      cancelLabel: 'Not yet',
      details: stop.scheduled_departure && action === 'depart' ? (
        <p className="notice"><Icon name="clock" size={16} /> Scheduled departure {fmtTime(stop.scheduled_departure)}. Delays of 60 minutes or more reserve a spare trainset automatically.</p>
      ) : null,
    })
    if (!ok) return
    setMarking(`${stop.trip_stop_id}-${action}`)
    try {
      const result = await api(`/operator/trips/${selected}/stops/${stop.trip_stop_id}/${action}`, { method: 'POST' })
      if (action === 'depart' && result.spare?.triggered)
        setToast(result.spare.trainsetCode ? `Delay ${result.delayMinutes} min: spare ${result.spare.trainsetCode} reserved for next opposite trip` : `Delay threshold triggered: ${result.spare.reason}`)
      else if (result.destinationReached) setToast(`Journey completed: ${result.rotation?.action || 'trainset rotation updated'}`)
      else setToast(`${stop.station_name} ${action === 'arrive' ? 'arrival' : 'departure'} recorded`)
      setOps(await api(`/operator/trips/${selected}`))
      await loadTrips()
    } catch (err) {
      handleError(err)
    } finally {
      setMarking(null)
    }
  }

  if (!allowed) return <AccessCard title="Operator access required" copy="Only the operator assigned to a trip can record its station arrivals and departures." icon="lock" />

  const delayed = trips.filter((t) => Number(t.current_delay_minutes) > 0).length
  const done = trips.filter((t) => t.trip_status === 'COMPLETED').length
  const clock = new Date(now).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', second: '2-digit' })

  return (
    <main className="page page-enter ws-page">
      <PageHeader
        crumbs={['Operator', 'Station console']}
        title="Station console"
        description="Record arrivals and departures for your assigned trips, in station order."
        actions={
          <>
            <div className="op-clock" aria-label={`Current time ${clock}`}><Icon name="clock" size={17} /><b className="t-num">{clock}</b></div>
            <div className="op-date"><DatePicker value={date} onChange={setDate} ariaLabel="Operating date" label="Operating date" /></div>
            <Button variant="secondary" icon="refresh" onClick={loadTrips} loading={loading && !marking}>Refresh</Button>
          </>
        }
      />

      <section className="stat-grid" aria-label="Today’s trips">
        <StatCard icon="layers" label="Assigned trips" value={trips.length} />
        <StatCard icon="clock" label="Running late" value={delayed} tone={delayed ? 'danger' : 'brand'} />
        <StatCard icon="checkCircle" label="Completed" value={done} tone="info" />
      </section>

      <div className="op-layout">
        <aside className="card op-trips" aria-label="Assigned trips">
          <h2 className="op-title">Assigned trips</h2>
          {loading && !trips.length ? <SkeletonRows rows={3} /> : !trips.length ? (
            <EmptyState compact icon="layers" title="No trips on this date" description="Trips assigned to you by an admin will appear here." />
          ) : (
            <div className="op-trip-list">
              {trips.map((t) => (
                <button type="button" className={`op-trip ${Number(selected) === Number(t.trip_id) ? 'is-active' : ''}`} key={t.trip_id} onClick={() => open(t.trip_id)} aria-pressed={Number(selected) === Number(t.trip_id)}>
                  <span className="op-trip-time t-num">{fmtTime(t.scheduled_departure)}</span>
                  <span className="grow">
                    <b>{t.train_name} <small className="t-num">#{t.trip_id}</small></b>
                    <span>{t.source_station} → {t.destination_station}</span>
                  </span>
                  <span className="op-trip-status">
                    <StatusBadge status={t.trip_status} />
                    <small className={Number(t.current_delay_minutes) > 0 ? 'is-late' : ''}>{delayText(t.current_delay_minutes)}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="card op-stops" aria-live="polite">
          {!ops ? (
            <EmptyState icon="signal" title="Select a trip to begin" description="Choose one of your assigned trips, then record Arrived and Departed at each station in order." />
          ) : (
            <>
              <header className="op-stops-head">
                <div>
                  <span className="live-card-sub t-num">Trip #{ops.trip.trip_id} · {ops.trip.direction}</span>
                  <h2>{ops.live?.train_name}</h2>
                  <p>{ops.live?.last_left_station ? `Last left ${ops.live.last_left_station} at ${fmtTime(ops.live.last_left_at)}` : 'Awaiting first departure'}</p>
                </div>
                <div className="row">
                  <StatusBadge status={ops.trip.trip_status} />
                  <DelayBadge minutes={ops.live?.current_delay_minutes} />
                </div>
              </header>
              <StopTimeline
                stops={ops.stops}
                renderActions={(s) => {
                  const departureLocked = s.scheduled_departure && now < new Date(s.scheduled_departure).getTime()
                  const canArrive = s.scheduled_arrival && !s.actual_arrival
                  const canDepart = s.scheduled_departure && !s.actual_departure && (!s.scheduled_arrival || s.actual_arrival)
                  const recorded = s.scheduled_arrival && s.actual_arrival && (!s.scheduled_departure || s.actual_departure)
                  return (
                    <>
                      {canArrive && (
                        <Button variant="secondary" size="sm" icon="mapPin" loading={marking === `${s.trip_stop_id}-arrive`} disabled={Boolean(marking)} onClick={() => mark(s, 'arrive')}>
                          Arrived
                        </Button>
                      )}
                      {canDepart && (
                        <Button size="sm" icon="arrow" loading={marking === `${s.trip_stop_id}-depart`} disabled={departureLocked || Boolean(marking)} title={departureLocked ? `Departure opens at ${fmtTime(s.scheduled_departure)}` : 'Record departure'} onClick={() => mark(s, 'depart')}>
                          {departureLocked ? `Opens ${fmtTime(s.scheduled_departure)}` : 'Departed'}
                        </Button>
                      )}
                      {recorded && <span className="badge badge-success"><Icon name="check" size={13} /> Recorded</span>}
                    </>
                  )
                }}
              />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
