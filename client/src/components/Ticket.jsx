import { useState } from 'react'
import { Icon } from './Icons'
import Logo from './brand/Logo'
import { RouteLine } from './ui/Rail'
import { StatusBadge } from './ui/Feedback'
import { durationText, fmtDate, fmtWeekday, money } from '../lib/format'

export function CopyChip({ value, label = 'Copy booking reference' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* clipboard blocked: the value stays visible to select manually */ }
  }
  return (
    <button type="button" className={`copy-chip ${copied ? 'is-copied' : ''}`} onClick={copy} aria-label={`${label} ${value}`}>
      <span>{value}</span>
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      <span className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
    </button>
  )
}

/** The FERROVIA e-ticket. Shows only fields the booking API returns. */
export default function Ticket({ booking, animate = false }) {
  const people = booking.passengers || []
  const seats = people.map((p) => `${p.coach_code}-${p.seat_number}`)
  return (
    <article className={`eticket ${animate ? 'is-animated' : ''}`} aria-label={`E-ticket ${booking.pnr_number}`}>
      <div className="eticket-main">
        <header className="eticket-head">
          <Logo variant="horizontal" tone="dark" />
          <span className="eticket-kind">E-ticket</span>
        </header>
        <div className="eticket-body">
          <div className="eticket-train">
            <div>
              <small>Train</small>
              <h3>{booking.train_name}</h3>
            </div>
            <StatusBadge status={booking.booking_status || 'CONFIRMED'} />
          </div>
          <RouteLine
            size="lg"
            from={booking.source_station}
            to={booking.destination_station}
            departure={booking.scheduled_departure}
            arrival={booking.scheduled_arrival}
            duration={durationText(booking.scheduled_departure, booking.scheduled_arrival)}
            animate={animate}
          />
          <dl className="eticket-grid">
            <div className="kv"><dt>Date</dt><dd>{fmtWeekday(booking.scheduled_departure)} {fmtDate(booking.scheduled_departure)}</dd></div>
            <div className="kv"><dt>Class</dt><dd>{booking.class_name || '—'}</dd></div>
            <div className="kv"><dt>Seat{seats.length > 1 ? 's' : ''}</dt><dd>{seats.join(', ') || '—'}</dd></div>
            <div className="kv"><dt>Fare paid</dt><dd>{money(booking.total_fare)}</dd></div>
          </dl>
          {people.length > 0 && (
            <ul className="eticket-people">
              {people.map((p) => (
                <li key={p.passenger_id ?? `${p.coach_code}-${p.seat_number}`}>
                  <span className="eticket-seat t-num">{p.coach_code}-{p.seat_number}</span>
                  <span className="grow"><b>{p.passenger_name}</b><small>{[p.age, p.gender && String(p.gender).toLowerCase()].filter(Boolean).join(' · ')}</small></span>
                  {p.ticket_status && <StatusBadge status={p.ticket_status} />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="eticket-stub">
        <span className="eticket-notch is-top" aria-hidden="true" />
        <span className="eticket-notch is-bottom" aria-hidden="true" />
        <small>Booking reference (PNR)</small>
        <strong className="eticket-pnr t-num">{booking.pnr_number}</strong>
        <span className="eticket-stub-rail" aria-hidden="true"><i /><i /><i /></span>
        <small className="eticket-note">Show this reference with a valid photo ID when asked.</small>
      </div>
    </article>
  )
}
