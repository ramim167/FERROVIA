import { useCallback, useEffect, useState } from 'react'
import { Icon } from './Icons'
import { api } from '../lib/api'

function money(value) {
  return `৳${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function dateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
  })
}

export default function AdminCancellationRequests({ user, handleError, setToast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      setRequests(await api('/admin/cancellation-requests'))
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [handleError])

  useEffect(() => {
    if (user?.role === 'ADMIN') loadRequests()
  }, [user?.role, loadRequests])

  async function decide(request, decision) {
    const action = decision === 'APPROVE' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${action} cancellation ${request.pnr_number}?`)) return

    setSavingId(request.cancellation_request_id)
    try {
      const result = await api(`/admin/cancellation-requests/${request.cancellation_request_id}`, {
        method: 'PATCH',
        body: { decision },
      })
      setRequests(current => current.filter(
        item => item.cancellation_request_id !== request.cancellation_request_id
      ))
      setToast(result.status === 'APPROVED'
        ? Number(result.refund_amount) > 0
          ? `Cancellation approved. Refund of ${money(result.refund_amount)} is being processed.`
          : 'Cancellation approved. No refund applies.'
        : 'Cancellation rejected. The booking remains confirmed.')
    } catch (error) {
      handleError(error)
    } finally {
      setSavingId(null)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page">
        <div className="card access-card">
          <Icon name="shield" size={36} />
          <h2>Admin access required</h2>
          <p>Only administrators can review cancellation requests.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page admin-cancellations-page">
      <div className="page-title">
        <span className="eyebrow">ADMIN / BOOKINGS</span>
        <h1>Cancellation requests</h1>
        <p>Review the request and estimated refund before deciding.</p>
      </div>

      <div className="admin-cancellation-toolbar">
        <span>{requests.length} pending</span>
        <button className="secondary" onClick={loadRequests} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && requests.length === 0 ? (
        <div className="card empty"><p>Loading cancellation requests...</p></div>
      ) : requests.length === 0 ? (
        <div className="card empty">
          <Icon name="check" size={38} />
          <h2>No pending cancellation requests</h2>
        </div>
      ) : (
        <div className="admin-cancellation-list">
          {requests.map(request => (
            <article className="card admin-cancellation-card" key={request.cancellation_request_id}>
              <div className="admin-cancellation-card-head">
                <div>
                  <span className="eyebrow">PNR {request.pnr_number}</span>
                  <h2>{request.train_name}</h2>
                  <p>{request.source_station} → {request.destination_station}</p>
                </div>
                <span className="admin-cancellation-pending">PENDING</span>
              </div>

              <dl className="admin-cancellation-details">
                <div><dt>Passenger</dt><dd>{request.passenger_name}</dd></div>
                <div><dt>Requested</dt><dd>{dateTime(request.requested_at)}</dd></div>
                <div><dt>Departure</dt><dd>{dateTime(request.scheduled_departure)}</dd></div>
                <div><dt>Booking total</dt><dd>{money(request.total_fare)}</dd></div>
                <div><dt>Refund estimate</dt><dd>{money(request.refund_amount)} ({Number(request.refund_percent)}%)</dd></div>
              </dl>

              {Number(request.refund_percent) === 0 && (
                <p className="admin-cancellation-no-refund">No refund applies because departure is within 24 hours.</p>
              )}

              <div className="admin-cancellation-actions">
                <button
                  className="secondary"
                  disabled={savingId === request.cancellation_request_id}
                  onClick={() => decide(request, 'REJECT')}
                >
                  Reject
                </button>
                <button
                  className="primary"
                  disabled={savingId === request.cancellation_request_id}
                  onClick={() => decide(request, 'APPROVE')}
                >
                  {savingId === request.cancellation_request_id ? 'Saving...' : 'Approve cancellation'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
