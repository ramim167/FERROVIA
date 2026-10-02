import { useCallback, useEffect, useState } from 'react'
import DatePicker from '../components/DatePicker'
import { Icon } from '../components/Icons'
import { Button } from '../components/ui/Button'
import { Badge, DelayBadge, EmptyState, ErrorState, SkeletonRows, StatusBadge } from '../components/ui/Feedback'
import { PageHeader, SectionHeader, StatCard } from '../components/ui/Layout'
import { api } from '../lib/api'
import { fmtDateTime, fmtTime, localToday, money } from '../lib/format'
import AccessCard from '../components/AccessCard'

/**
 * Operations overview. Every number here is derived from existing admin
 * endpoints: trips for the date, pending operators, cancellation requests
 * and train services. Nothing is estimated or simulated.
 */
export default function AdminOverview({ user, handleError, navigate }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [date, setDate] = useState(localToday())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState({})
  const allowed = user?.role === 'ADMIN'

  const load = useCallback(async () => {
    if (!allowed) return
    setLoading(true)
    setFailed({})
    try {
      const results = await Promise.allSettled([
        api(`/admin/trips?date=${date}`),
        api('/admin/operators/pending'),
        api('/admin/cancellation-requests'),
        api('/admin/train-services'),
      ])
      const next = {}, errors = {}
      results.forEach((result, i) => {
        const key = ['trips', 'pending', 'cancellations', 'trains'][i]
        next[key] = result.status === 'fulfilled' ? result.value : []
        if (result.status === 'rejected') errors[key] = result.reason.message
      })
      setData(next)
      setFailed(errors)
    } catch (err) {
      setFailed({ trips: err.message })
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [allowed, date, handleError])
  useEffect(() => { load() }, [load])

  if (!allowed) return <AccessCard title="Admin access required" copy="The operations overview is only available to administrator accounts." icon="lock" />

  const now = Date.now()
  const trips = data?.trips || []
  const open = trips.filter((t) => new Date(t.scheduled_departure).getTime() > now && ['SCHEDULED', 'BOARDING'].includes(t.trip_status))
  const noTrainset = open.filter((t) => !t.assigned_trainset_id)
  const noOperator = open.filter((t) => !t.operator_user_id)
  const late = trips.filter((t) => Number(t.current_delay_minutes) > 0)
  const activeTrains = (data?.trains || []).filter((t) => t.train_status === 'ACTIVE').length
  const sorted = trips.filter(t => (!query || `${t.train_name} ${t.train_code} ${t.source_station} ${t.destination_station}`.toLowerCase().includes(query.toLowerCase())) && (status === 'all' || t.trip_status === status)).sort((a, b) => new Date(a.scheduled_departure) - new Date(b.scheduled_departure))

  return (
    <main className="page page-enter ws-page">
      <PageHeader
        crumbs={['Admin', 'Operations overview']}
        title="Operations overview"
        description="Today’s network at a glance: what still needs a trainset or operator, and which requests are waiting."
        actions={
          <>
            <div className="op-date"><DatePicker value={date} onChange={setDate} label="Operating date" ariaLabel="Operating date" /></div>
            <Button variant="secondary" icon="refresh" onClick={load} loading={loading}>Refresh</Button>
          </>
        }
      />

      {failed.trains && <ErrorState title="Train services couldn’t load" description={failed.trains} onRetry={load} />}

      <section className="stat-grid stat-grid-6" aria-label="Key figures">
        <StatCard icon="layers" label="Trips on this date" value={data && !failed.trips ? trips.length : '—'} hint={failed.trains ? 'Train services unavailable' : `${activeTrains} active train services`} />
        <StatCard icon="train" label="Need a trainset" value={data && !failed.trips ? noTrainset.length : '—'} tone={noTrainset.length ? 'warning' : 'brand'} hint="Upcoming, unassigned" onClick={() => navigate('admin-assign-trip')} />
        <StatCard icon="user" label="Need an operator" value={data && !failed.trips ? noOperator.length : '—'} tone={noOperator.length ? 'warning' : 'brand'} hint="Upcoming, unassigned" onClick={() => navigate('admin-assign-trip')} />
        <StatCard icon="clock" label="Running late" value={data && !failed.trips ? late.length : '—'} tone={late.length ? 'danger' : 'brand'} hint="Trips with a recorded delay" />
        <StatCard icon="receipt" label="Cancellations" value={data && !failed.cancellations ? data.cancellations.length : '—'} tone={data?.cancellations.length ? 'accent' : 'brand'} hint="Waiting for review" onClick={() => navigate('admin-cancellations')} />
        <StatCard icon="userCheck" label="Operator approvals" value={data && !failed.pending ? data.pending.length : '—'} tone={data?.pending.length ? 'info' : 'brand'} hint="Accounts to verify" onClick={() => navigate('admin-operator-approvals')} />
      </section>

      <div className="admin-overview-grid">
        <section className="card">
          <SectionHeader title="Departures" description="All trips issued for the selected date." icon="layers" actions={<Button variant="tertiary" size="sm" iconRight="arrow" onClick={() => navigate('admin-assign-trip')}>Manage assignments</Button>} />
          <div className="row" style={{ marginBottom: 16 }}><label className="grow">Search departures<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Train, code or station" /></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{[...new Set(trips.map(t => t.trip_status))].map(s => <option key={s}>{s}</option>)}</select></label></div>
          {failed.trips ? <ErrorState title="Departures couldn’t load" description={failed.trips} onRetry={load} /> : loading && !data ? <SkeletonRows rows={4} /> : !sorted.length ? (
            <EmptyState compact icon="layers" title="No trips on this date" description="Trips appear once they are issued for the selected date." />
          ) : (
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable table">
              <table className="departures-table">
                <thead><tr><th>Departure</th><th>Train</th><th>Route</th><th>Status</th><th>Trainset</th><th>Operator</th></tr></thead>
                <tbody>
                  {sorted.map((t) => {
                    const passed = new Date(t.scheduled_departure).getTime() <= now
                    return (
                      <tr key={t.trip_id} className={passed && t.trip_status === 'SCHEDULED' ? 'is-muted' : ''}>
                        <td data-label="Departure"><span className="cell-primary t-num">{fmtTime(t.scheduled_departure)}</span><span className="cell-secondary t-num">#{t.trip_id}</span></td>
                        <td data-label="Train"><span className="cell-primary">{t.train_name}</span><span className="cell-secondary">{t.train_code} · {t.direction}</span></td>
                        <td data-label="Route">{t.source_station} → {t.destination_station}</td>
                        <td data-label="Status"><div className="row" style={{ gap: 6 }}><StatusBadge status={t.trip_status} />{Number(t.current_delay_minutes) > 0 && <DelayBadge minutes={t.current_delay_minutes} />}</div></td>
                        <td data-label="Trainset">{t.assigned_trainset_code ? <Badge tone="brand">{t.assigned_trainset_code}</Badge> : <Badge tone="warning">Unassigned</Badge>}</td>
                        <td data-label="Operator">{t.operator_name || (t.operator_user_id ? `#${t.operator_user_id}` : <Badge tone="warning">Unassigned</Badge>)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="stack">
          <section className="card">
            <SectionHeader title="Cancellation requests" icon="receipt" actions={data?.cancellations.length ? <button type="button" className="link-btn" onClick={() => navigate('admin-cancellations')}>Review <Icon name="arrow" size={15} /></button> : null} />
            {failed.cancellations ? <ErrorState title="Cancellations couldn’t load" description={failed.cancellations} onRetry={load} /> : !data ? <SkeletonRows rows={2} /> : data.cancellations.length ? (
              <ul className="mini-list">
                {data.cancellations.slice(0, 4).map((r) => (
                  <li key={r.cancellation_request_id}>
                    <span className="mini-list-icon tone-accent"><Icon name="undo" size={16} /></span>
                    <span className="grow"><b>{r.passenger_name} · <span className="t-num">{r.pnr_number}</span></b><small>{r.train_name} · requested {fmtDateTime(r.requested_at)}</small></span>
                    <span className="t-num mini-list-value">{money(r.refund_amount)}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState compact icon="checkCircle" title="No requests waiting" />}
          </section>
          <section className="card">
            <SectionHeader title="Operator approvals" icon="userCheck" actions={data?.pending.length ? <button type="button" className="link-btn" onClick={() => navigate('admin-operator-approvals')}>Review <Icon name="arrow" size={15} /></button> : null} />
            {failed.pending ? <ErrorState title="Operator approvals couldn’t load" description={failed.pending} onRetry={load} /> : !data ? <SkeletonRows rows={2} /> : data.pending.length ? (
              <ul className="mini-list">
                {data.pending.slice(0, 4).map((o) => (
                  <li key={o.user_id}>
                    <span className="mini-list-icon tone-info"><Icon name="user" size={16} /></span>
                    <span className="grow"><b>{o.full_name}</b><small>{o.email}</small></span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState compact icon="checkCircle" title="No accounts waiting" />}
          </section>
          <section className="card quick-grid">
            <button type="button" onClick={() => navigate('admin-add-train')}><Icon name="plus" size={18} /> Add train service</button>
            <button type="button" onClick={() => navigate('admin-edit-train')}><Icon name="settings" size={18} /> Edit a train</button>
            <button type="button" onClick={() => navigate('track')}><Icon name="signal" size={18} /> Track a train</button>
          </section>
        </div>
      </div>
    </main>
  )
}
