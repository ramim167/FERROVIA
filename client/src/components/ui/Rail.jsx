import { Icon } from '../Icons'
import { fmtTime } from '../../lib/format'

/**
 * RouteLine — the FERROVIA signature: departure and arrival joined by a rail
 * with station nodes. Used on result cards, tickets, the dashboard and tracking.
 */
export function RouteLine({ from, to, fromCode, toCode, departure, arrival, duration, note, size = 'md', animate = false, live = false }) {
  return (
    <div className={`route-line route-line-${size} ${animate ? 'is-animated' : ''} ${live ? 'is-live' : ''}`}>
      <div className="route-end">
        <span className="route-time t-num">{departure ? fmtTime(departure) : '—'}</span>
        <span className="route-station">{fromCode && <b className="route-code">{fromCode}</b>}{from}</span>
      </div>
      <div className="route-track" aria-hidden={!duration}>
        <span className="route-node" />
        <span className="route-rail"><span className="route-rail-fill" /></span>
        <span className="route-node is-end" />
        {duration && <span className="route-duration"><Icon name="clock" size={13} />{duration}</span>}
        {note && <span className="route-note">{note}</span>}
      </div>
      <div className="route-end is-arrival">
        <span className="route-time t-num">{arrival ? fmtTime(arrival) : '—'}</span>
        <span className="route-station">{toCode && <b className="route-code">{toCode}</b>}{to}</span>
      </div>
    </div>
  )
}

const STEPS = [
  ['Train', 'train'],
  ['Seats', 'seat'],
  ['Passengers', 'users'],
  ['Payment', 'card'],
  ['E-ticket', 'ticket'],
]

/** Booking progress drawn as a line of stations; the train sits at the current stop. */
export function BookingStepper({ step }) {
  return (
    <nav className="stepper" aria-label="Booking progress">
      <ol style={{ '--progress': step / (STEPS.length - 1) }}>
        {STEPS.map(([label, icon], index) => {
          const state = index < step ? 'complete' : index === step ? 'current' : 'upcoming'
          return (
            <li key={label} className={`stepper-stop is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="stepper-node">
                <Icon name={state === 'complete' ? 'check' : icon} size={15} />
              </span>
              <span className="stepper-label">{label}</span>
              <span className="sr-only">{state === 'complete' ? 'completed' : state === 'current' ? 'current step' : 'not started'}</span>
            </li>
          )
        })}
      </ol>
      <span className="stepper-count">Step {step + 1} of {STEPS.length}</span>
    </nav>
  )
}

const stopState = (s) => {
  if (s.actual_departure || (!s.scheduled_departure && s.actual_arrival)) return 'passed'
  if (s.actual_arrival && !s.actual_departure) return 'current'
  return 'upcoming'
}

/**
 * Vertical station timeline built only from data the backend provides:
 * scheduled vs actual arrival/departure per stop.
 */
export function StopTimeline({ stops = [], renderActions }) {
  const lastPassed = stops.reduce((acc, s, i) => (stopState(s) !== 'upcoming' ? i : acc), -1)
  return (
    <ol className="timeline">
      {stops.map((s, i) => {
        const state = stopState(s)
        const isNext = state === 'upcoming' && i === lastPassed + 1 && lastPassed >= 0
        return (
          <li key={s.trip_stop_id ?? i} className={`timeline-stop is-${state} ${isNext ? 'is-next' : ''}`}>
            <span className="timeline-node" aria-hidden="true">
              {state === 'passed' ? <Icon name="check" size={12} strokeWidth={2.6} /> : state === 'current' ? <span className="timeline-pulse" /> : null}
            </span>
            <div className="timeline-main">
              <div className="timeline-title">
                <b>{s.station_name}</b>
                {state === 'current' && <span className="timeline-tag is-current">At station</span>}
                {isNext && <span className="timeline-tag">Next stop</span>}
              </div>
              <div className="timeline-times">
                <span>
                  <small>Scheduled</small>
                  <span className="t-num">
                    {s.scheduled_arrival ? `Arr ${fmtTime(s.scheduled_arrival)}` : ''}
                    {s.scheduled_arrival && s.scheduled_departure ? ' · ' : ''}
                    {s.scheduled_departure ? `Dep ${fmtTime(s.scheduled_departure)}` : ''}
                  </span>
                </span>
                <span>
                  <small>Actual</small>
                  <span className="t-num">
                    {s.actual_arrival ? `Arr ${fmtTime(s.actual_arrival)}` : ''}
                    {s.actual_arrival && s.actual_departure ? ' · ' : ''}
                    {s.actual_departure ? `Dep ${fmtTime(s.actual_departure)}` : ''}
                    {!s.actual_arrival && !s.actual_departure ? '—' : ''}
                  </span>
                </span>
              </div>
            </div>
            {renderActions && <div className="timeline-actions">{renderActions(s, i, state)}</div>}
          </li>
        )
      })}
    </ol>
  )
}
