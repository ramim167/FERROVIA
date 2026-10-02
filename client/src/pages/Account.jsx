import AccessCard from '../components/AccessCard'
import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icons'
import Ticket, { CopyChip } from '../components/Ticket'
import { Button } from '../components/ui/Button'
import { Badge, EmptyState, StatusBadge } from '../components/ui/Feedback'
import { PageHeader, SectionHeader, StatCard, Tabs } from '../components/ui/Layout'
import { Modal } from '../components/ui/Overlay'
import { RouteLine } from '../components/ui/Rail'
import { api } from '../lib/api'
import { useConfirm } from '../lib/confirm'
import { durationText, fmtDate, fmtTime, fmtWeekday, money, relativeTime } from '../lib/format'
import { workspaceFor } from '../lib/roles'
import { downloadJourneyCalendar } from '../lib/calendar'

function useNow(interval = 30000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(t)
  }, [interval])
  return now
}

function countdown(target, now) {
  const mins = Math.round((new Date(target).getTime() - now) / 60000)
  if (mins <= 0) return 'Departing now'
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (d) return `Departs in ${d} d ${h} h`
  if (h) return `Departs in ${h} h ${m} min`
  return `Departs in ${m} min`
}

const isCancelled = (b) => ['CANCELLED', 'REFUNDED'].includes(String(b.booking_status).toUpperCase())
const isUpcoming = (b, now) => !isCancelled(b) && new Date(b.scheduled_departure).getTime() >= now

/* ---------------------------------------------------------------- dashboard */

export function Dashboard({ user, bookings, favorites, notifications, navigate, onAuth }) {
  const now = useNow()
  if (!user)
    return <AccessCard title="Sign in to see your travel dashboard" copy="Your upcoming journeys, tickets and travel updates, together in one place." action="Sign in" onAction={onAuth} icon="chart" />
  const confirmed = bookings.filter((b) => b.booking_status === 'CONFIRMED')
  const spent = confirmed.reduce((sum, b) => sum + Number(b.total_fare || 0), 0)
  const upcoming = [...confirmed].filter((b) => new Date(b.scheduled_departure) >= new Date()).sort((a, b) => new Date(a.scheduled_departure) - new Date(b.scheduled_departure))
  const next = upcoming[0]
  const unread = notifications.filter((n) => Number(n.is_read) === 0).length
  const recent = [...bookings].sort((a, b) => new Date(b.booking_time) - new Date(a.booking_time)).slice(0, 4)
  const workspace = workspaceFor(user)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <main className="page page-enter dashboard">
      <PageHeader
        overline={greeting}
        title={`Welcome back, ${user.full_name?.split(' ')[0]}`}
        description="Your journeys, tickets and travel updates in one place."
        actions={<><Button variant="secondary" icon="signal" onClick={() => navigate('track')}>Track a train</Button><Button icon="search" onClick={() => navigate('search')}>Plan a journey</Button></>}
      />

      <section className="next-trip" aria-labelledby="next-trip-title">
        {next ? (
          <>
            <div className="next-trip-top">
              <div>
                <span className="next-trip-label" id="next-trip-title"><span className="badge-dot is-pulsing" /> Next journey</span>
                <h2>{next.train_name}</h2>
              </div>
              <span className="next-trip-countdown t-num">{countdown(next.scheduled_departure, now)}</span>
            </div>
            <RouteLine size="lg" from={next.source_station} to={next.destination_station} departure={next.scheduled_departure} arrival={next.scheduled_arrival} duration={durationText(next.scheduled_departure, next.scheduled_arrival)} animate />
            <div className="next-trip-foot">
              <span><small>Date</small><b>{fmtWeekday(next.scheduled_departure)} {fmtDate(next.scheduled_departure)}</b></span>
              <span><small>PNR</small><CopyChip value={next.pnr_number} /></span>
              <span><small>Fare</small><b className="t-num">{money(next.total_fare)}</b></span>
              <Button variant="inverse" size="sm" iconRight="arrow" onClick={() => navigate('tickets')}>View ticket</Button>
            </div>
          </>
        ) : (
          <div className="next-trip-empty">
            <div>
              <span className="next-trip-label">Next journey</span>
              <h2>No upcoming journeys</h2>
              <p>When you book a train, it will appear here with a countdown to departure.</p>
            </div>
            <Button variant="inverse" icon="search" onClick={() => navigate('search')}>Find trains</Button>
          </div>
        )}
      </section>

      <section className="stat-grid" aria-label="Your travel at a glance">
        <StatCard icon="ticket" label="Upcoming journeys" value={upcoming.length} hint={`${confirmed.length} confirmed in total`} onClick={() => navigate('tickets')} />
        <StatCard icon="heart" label="Saved trains" value={favorites.length} hint="Saved from search results" tone="danger" />
        <StatCard icon="wallet" label="Booked value" value={money(spent)} hint="Confirmed bookings" tone="accent" />
        <StatCard icon="bell" label="Unread alerts" value={unread} hint="Booking and refund updates" tone="info" onClick={() => navigate('notifications')} />
      </section>

      <div className="dash-grid">
        <section className="card">
          <SectionHeader title="Recent bookings" icon="receipt" actions={<button type="button" className="link-btn" onClick={() => navigate('tickets')}>All tickets <Icon name="arrow" size={15} /></button>} />
          {recent.length ? (
            <ul className="mini-list">
              {recent.map((b) => (
                <li key={b.pnr_number}>
                  <span className="mini-list-icon"><Icon name="ticket" size={18} /></span>
                  <span className="grow">
                    <b>{b.source_station} → {b.destination_station}</b>
                    <small>{b.train_name} · {fmtDate(b.scheduled_departure)}</small>
                  </span>
                  <StatusBadge status={b.cancellation_request_status === 'REQUESTED' ? 'REQUESTED' : b.booking_status} label={b.cancellation_request_status === 'REQUESTED' ? 'Cancellation requested' : undefined} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact icon="ticket" title="No bookings yet" description="Your booking history starts with your first journey." action={<Button size="sm" onClick={() => navigate('search')}>Book a ticket</Button>} />
          )}
        </section>

        <section className="card">
          <SectionHeader title="Latest updates" icon="bell" actions={<button type="button" className="link-btn" onClick={() => navigate('notifications')}>All <Icon name="arrow" size={15} /></button>} />
          {notifications.length ? (
            <ul className="mini-list">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.notification_id} className={Number(n.is_read) ? '' : 'is-unread'}>
                  <span className="mini-list-dot" aria-hidden="true" />
                  <span className="grow"><b>{n.title}</b><small>{relativeTime(n.created_at)}</small></span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact icon="bell" title="Nothing new" description="Booking confirmations and refund updates appear here." />
          )}
          <div className="quick-actions">
            <button type="button" onClick={() => navigate('track')}><Icon name="signal" size={18} /> Track a train</button>
            <button type="button" onClick={() => navigate('support')}><Icon name="support" size={18} /> Help centre</button>
            {workspace && <button type="button" onClick={() => navigate(workspace.page)}><Icon name={workspace.icon} size={18} /> {workspace.label}</button>}
          </div>
        </section>
      </div>
    </main>
  )
}

/* ---------------------------------------------------------------- tickets */

const REFUND_POLICY = [
  ['Within 24 h of booking', '70% refund'],
  ['24 – 72 h after booking', '50% refund'],
  ['After 72 h', '20% refund'],
  ['Departure within 24 h', 'No refund'],
]

function RefundTimeline({ booking }) {
  const people = booking.passengers || []
  const refund = people.find((p) => p.refund_status)
  const requested = booking.cancellation_request_status || isCancelled(booking) || refund
  if (!requested) return null
  const rejected = booking.cancellation_request_status === 'REJECTED'
  const reviewed = isCancelled(booking) || rejected || ['APPROVED'].includes(booking.cancellation_request_status)
  const steps = [
    ['Cancellation requested', 'complete'],
    [rejected ? 'Request declined, booking kept' : reviewed ? 'Approved by FERROVIA' : 'Awaiting admin review', reviewed ? 'complete' : 'current'],
    [refund ? `Refund ${String(refund.refund_status).toLowerCase()} · ${money(people.reduce((s, p) => s + Number(p.refund_amount || 0), 0))}` : rejected ? 'No refund issued' : 'Refund issued after approval', refund ? 'complete' : 'upcoming'],
  ]
  return (
    <section className="refund">
      <h3>Cancellation and refund</h3>
      <ol className="refund-steps">
        {steps.map(([label, state]) => (
          <li key={label} className={`is-${state}`}><span className="refund-node">{state === 'complete' && <Icon name="check" size={11} strokeWidth={3} />}</span>{label}</li>
        ))}
      </ol>
    </section>
  )
}

function BookingModal({ booking, close }) {
  return (
    <Modal title={booking.train_name} description={`PNR ${booking.pnr_number}`} onClose={close} size="lg" className="booking-dialog"
      footer={<><Button variant="secondary" onClick={close}>Close</Button><Button icon="print" onClick={() => window.print()}>Print ticket</Button></>}>
      <div className="stack">
        <Ticket booking={booking} />
        <RefundTimeline booking={booking} />
      </div>
    </Modal>
  )
}

export function Tickets({ user, bookings, navigate, cancel, onAuth, handleError }) {
  const [selected, setSelected] = useState(null)
  const [loadingPnr, setLoadingPnr] = useState(null)
  const [tab, setTab] = useState('upcoming')
  const confirm = useConfirm()
  const now = useNow()
  const groups = useMemo(() => ({
    upcoming: bookings.filter((b) => isUpcoming(b, now)),
    past: bookings.filter((b) => !isCancelled(b) && !isUpcoming(b, now)),
    cancelled: bookings.filter(isCancelled),
  }), [bookings, now])
  if (!user) return <AccessCard title="Sign in to see your tickets" copy="Keep your bookings, seats and e-tickets together in one place." action="Sign in" onAction={onAuth} icon="wallet" />

  const open = async (b) => {
    setLoadingPnr(b.pnr_number)
    try {
      const detail = await api(`/bookings/${b.pnr_number}`)
      setSelected({ ...b, ...detail })
    } catch (err) {
      handleError(err)
    } finally {
      setLoadingPnr(null)
    }
  }
  const requestCancel = async (b) => {
    const ok = await confirm({
      tone: 'danger',
      title: `Cancel booking ${b.pnr_number}?`,
      description: `${b.train_name} · ${b.source_station} to ${b.destination_station} · ${fmtDate(b.scheduled_departure)}`,
      confirmLabel: 'Request cancellation',
      cancelLabel: 'Keep my booking',
      details: (
        <div className="stack-sm">
          <p className="secondary-text">Confirmed bookings are reviewed by FERROVIA before cancelling. Your seats stay reserved until then. The refund depends on when you booked:</p>
          <ul className="policy-list">{REFUND_POLICY.map(([when, what]) => <li key={when}><span>{when}</span><b>{what}</b></li>)}</ul>
          <p className="notice notice-warning"><Icon name="alert" size={16} /> Once approved, cancellation can’t be undone.</p>
        </div>
      ),
    })
    if (ok) cancel(b.pnr_number)
  }
  const list = groups[tab]

  return (
    <main className="page page-enter">
      <PageHeader overline="Ticket wallet" title="My tickets" description="Every booking with its seats, status and refund progress." actions={<Button icon="search" onClick={() => navigate('search')}>Book a new journey</Button>} />
      {!bookings.length ? (
        <div className="card"><EmptyState icon="ticket" title="No tickets yet" description="Book your first journey and your e-ticket will be kept here." action={<Button icon="search" onClick={() => navigate('search')}>Find trains</Button>} /></div>
      ) : (
        <>
          <Tabs id="bookings" value={tab} onChange={setTab} label="Booking groups" tabs={[{ id: 'upcoming', label: 'Upcoming', count: groups.upcoming.length }, { id: 'past', label: 'Past', count: groups.past.length }, { id: 'cancelled', label: 'Cancelled', count: groups.cancelled.length }]} />
          <div role="tabpanel" id="bookings-panel" aria-labelledby={`bookings-tab-${tab}`} tabIndex={0}>
          {!list.length ? (
            <div className="card"><EmptyState compact icon={tab === 'cancelled' ? 'checkCircle' : 'ticket'} title={tab === 'upcoming' ? 'No upcoming journeys' : tab === 'past' ? 'No past journeys yet' : 'No cancelled bookings'} description={tab === 'upcoming' ? 'Plan your next trip and it will show up here.' : undefined} action={tab === 'upcoming' ? <Button size="sm" onClick={() => navigate('search')}>Find trains</Button> : null} /></div>
          ) : (
            <div className="ticket-list">
              {list.map((b) => {
                const requested = b.cancellation_request_status === 'REQUESTED'
                return (
                  <article className={`ticket-row card status-${String(b.booking_status).toLowerCase()}`} key={b.pnr_number}>
                    <div className="ticket-row-main">
                      <div className="ticket-row-head">
                        <StatusBadge status={requested ? 'REQUESTED' : b.booking_status} label={requested ? 'Cancellation requested' : undefined} />
                        <CopyChip value={b.pnr_number} />
                      </div>
                      <h3>{b.train_name}</h3>
                      <RouteLine size="sm" from={b.source_station} to={b.destination_station} departure={b.scheduled_departure} arrival={b.scheduled_arrival} />
                    </div>
                    <div className="ticket-row-side">
                      <dl>
                        <div className="kv"><dt>Travel date</dt><dd>{fmtWeekday(b.scheduled_departure)} {fmtDate(b.scheduled_departure)}</dd></div>
                        <div className="kv"><dt>Total</dt><dd>{money(b.total_fare)}</dd></div>
                        <div className="kv"><dt>Booked</dt><dd>{fmtDate(b.booking_time)}</dd></div>
                      </dl>
                      <div className="ticket-row-actions">
                        {b.booking_status === 'CONFIRMED' && isUpcoming(b, now) && <Button variant="tertiary" size="sm" icon="calendar" onClick={() => downloadJourneyCalendar(b)}>Add to calendar</Button>}
                        <Button variant="secondary" size="sm" icon="eye" loading={loadingPnr === b.pnr_number} onClick={() => open(b)}>View</Button>
                        {b.booking_status === 'CONFIRMED' && requested ? (
                          <Badge tone="warning"><Icon name="clock" size={13} /> Awaiting review</Badge>
                        ) : ['CONFIRMED', 'PENDING'].includes(b.booking_status) ? (
                          <Button variant="danger-soft" size="sm" icon="undo" onClick={() => requestCancel(b)}>Cancel</Button>
                        ) : null}
                      </div>
                    </div>
                    {requested && <RefundTimeline booking={b} />}
                  </article>
                )
              })}
            </div>
          )}
          </div>
        </>
      )}
      {selected && <BookingModal booking={selected} close={() => setSelected(null)} />}
    </main>
  )
}

/* ---------------------------------------------------------------- notifications */

const notifIcon = (n) => {
  const t = `${n.title} ${n.message}`.toLowerCase()
  if (t.includes('refund')) return ['wallet', 'accent']
  if (t.includes('cancel')) return ['undo', 'danger']
  if (t.includes('confirm') || t.includes('booked')) return ['checkCircle', 'success']
  if (t.includes('delay') || t.includes('late')) return ['clock', 'warning']
  return ['bell', 'brand']
}

const dayLabel = (v) => {
  const d = new Date(v)
  const today = new Date()
  const y = new Date(); y.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return fmtDate(v)
}

export function NotificationsPage({ user, notifications, reload, onAuth, handleError }) {
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(null)
  if (!user) return <AccessCard title="Sign in to see notifications" copy="Booking confirmations, cancellations and refund updates are saved to your account." action="Sign in" onAction={onAuth} icon="bell" />
  const read = async (id) => {
    setBusy(id)
    try { await api(`/notifications/${id}/read`, { method: 'PATCH' }); await reload() } catch (err) { handleError(err) } finally { setBusy(null) }
  }
  const readAll = async () => {
    setBusy('all')
    try { await api('/notifications/read-all', { method: 'PATCH' }); await reload() } catch (err) { handleError(err) } finally { setBusy(null) }
  }
  const unread = notifications.filter((n) => !Number(n.is_read))
  const list = filter === 'unread' ? unread : notifications
  const grouped = list.reduce((acc, n) => {
    const key = dayLabel(n.created_at)
    ;(acc[key] ??= []).push(n)
    return acc
  }, {})

  return (
    <main className="page page-enter page-narrow">
      <PageHeader overline="Account" title="Notifications" description="Updates about your bookings, cancellations and refunds." actions={<Button variant="secondary" icon="check" onClick={readAll} disabled={!unread.length} loading={busy === 'all'}>Mark all read</Button>} />
      <Tabs id="notifications" value={filter} onChange={setFilter} label="Notification filter" tabs={[{ id: 'all', label: 'All', count: notifications.length }, { id: 'unread', label: 'Unread', count: unread.length }]} />
      <div role="tabpanel" id="notifications-panel" aria-labelledby={`notifications-tab-${filter}`} tabIndex={0}>
      {!list.length ? (
        <div className="card"><EmptyState icon="bell" title={filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'} description="We’ll let you know when a booking is confirmed or a refund changes." /></div>
      ) : (
        Object.entries(grouped).map(([day, items]) => (
          <section className="notif-group" key={day} aria-label={day}>
            <h2 className="notif-day">{day}</h2>
            <div className="notif-list">
              {items.map((n) => {
                const [icon, tone] = notifIcon(n)
                const isUnread = !Number(n.is_read)
                return (
                  <article className={`notif-card ${isUnread ? 'is-unread' : ''}`} key={n.notification_id}>
                    <span className={`notif-icon tone-${tone}`}><Icon name={icon} size={18} /></span>
                    <div className="grow">
                      <div className="notif-title"><b>{n.title}</b><time dateTime={n.created_at} title={new Date(n.created_at).toLocaleString()}>{fmtTime(n.created_at)}</time></div>
                      <p>{n.message}</p>
                    </div>
                    {isUnread && (
                      <button type="button" className="notif-read" onClick={() => read(n.notification_id)} disabled={busy === n.notification_id} aria-label={`Mark “${n.title}” as read`} title="Mark as read">
                        <span className="notif-unread-dot" /><Icon name="check" size={16} />
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        ))
      )}
      </div>
    </main>
  )
}
