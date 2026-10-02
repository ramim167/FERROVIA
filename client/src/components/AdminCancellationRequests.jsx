import { useCallback, useEffect, useState } from 'react'
import { Icon } from './Icons'
import { api } from '../lib/api'
import { useConfirm } from '../lib/confirm'
import { fmtDateTime, money } from '../lib/format'
import { Button } from './ui/Button'
import { Badge, EmptyState, SkeletonRows } from './ui/Feedback'
import { PageHeader } from './ui/Layout'

export default function AdminCancellationRequests({ user, handleError, setToast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const confirm = useConfirm()

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
    const approve = decision === 'APPROVE'
    const ok = await confirm({
      tone: approve ? 'danger' : 'warning',
      title: approve ? `Approve cancellation ${request.pnr_number}?` : `Reject cancellation ${request.pnr_number}?`,
      description: approve
        ? `The booking for ${request.passenger_name} will be cancelled and its seats released.`
        : `The booking for ${request.passenger_name} stays confirmed and no refund is issued.`,
      details: approve ? (
        <p className={`notice ${Number(request.refund_amount) > 0 ? 'notice-brand' : 'notice-warning'}`}>
          <Icon name="wallet" size={16} />
          {Number(request.refund_amount) > 0 ? <>Refund of <b>{money(request.refund_amount)}</b> ({Number(request.refund_percent)}%) will be processed.</> : 'No refund applies to this booking.'}
        </p>
      ) : null,
      confirmLabel: approve ? 'Approve and cancel booking' : 'Reject request',
      cancelLabel: 'Go back',
    })
    if (!ok) return

    setSavingId(`${request.cancellation_request_id}-${decision}`)
    try {
      const result = await api(`/admin/cancellation-requests/${request.cancellation_request_id}`, {
        method: 'PATCH',
        body: { decision },
      })
      setRequests((current) => current.filter((item) => item.cancellation_request_id !== request.cancellation_request_id))
      window.dispatchEvent(new Event('ferrovia:reviews-changed'))
      setToast(
        result.status === 'APPROVED'
          ? Number(result.refund_amount) > 0
            ? `Cancellation approved. Refund of ${money(result.refund_amount)} is being processed.`
            : 'Cancellation approved. No refund applies.'
          : 'Cancellation rejected. The booking remains confirmed.'
      )
    } catch (error) {
      handleError(error)
    } finally {
      setSavingId(null)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page page-enter">
        <div className="card"><EmptyState icon="lock" title="Admin access required" description="Only administrators can review cancellation requests." /></div>
      </main>
    )
  }

  return (
    <main className="page page-enter ws-page">
      <PageHeader
        crumbs={['Admin', 'Requests', 'Cancellations']}
        title="Cancellation requests"
        description="Check the booking and the estimated refund, then approve or reject each request."
        actions={<><Badge tone={requests.length ? 'accent' : 'neutral'}>{requests.length} pending</Badge><Button variant="secondary" icon="refresh" onClick={loadRequests} loading={loading}>Refresh</Button></>}
      />

      {loading && requests.length === 0 ? (
        <div className="card"><SkeletonRows rows={3} /></div>
      ) : requests.length === 0 ? (
        <div className="card"><EmptyState icon="checkCircle" title="No pending cancellation requests" description="New requests from passengers will appear here for review." /></div>
      ) : (
        <div className="review-list">
          {requests.map((request) => {
            const busy = savingId?.startsWith(`${request.cancellation_request_id}-`)
            return (
              <article className="card review-card" key={request.cancellation_request_id}>
                <header className="review-head">
                  <div>
                    <span className="review-ref t-num">PNR {request.pnr_number}</span>
                    <h2>{request.train_name}</h2>
                    <p>{request.source_station} → {request.destination_station}</p>
                  </div>
                  <Badge tone="warning" dot>Pending review</Badge>
                </header>
                <dl className="kv-grid">
                  <div className="kv"><dt>Passenger</dt><dd>{request.passenger_name}</dd></div>
                  <div className="kv"><dt>Requested</dt><dd>{fmtDateTime(request.requested_at)}</dd></div>
                  <div className="kv"><dt>Departure</dt><dd>{fmtDateTime(request.scheduled_departure)}</dd></div>
                  <div className="kv"><dt>Booking total</dt><dd>{money(request.total_fare)}</dd></div>
                  <div className="kv"><dt>Refund estimate</dt><dd className="is-accent">{money(request.refund_amount)} <small>({Number(request.refund_percent)}%)</small></dd></div>
                </dl>
                {Number(request.refund_percent) === 0 && (
                  <p className="notice notice-warning"><Icon name="info" size={16} /> No refund applies because departure is within 24 hours.</p>
                )}
                <footer className="review-actions">
                  <Button variant="secondary" disabled={busy} loading={savingId === `${request.cancellation_request_id}-REJECT`} onClick={() => decide(request, 'REJECT')}>Reject</Button>
                  <Button variant="danger" icon="check" disabled={busy} loading={savingId === `${request.cancellation_request_id}-APPROVE`} loadingText="Saving…" onClick={() => decide(request, 'APPROVE')}>Approve cancellation</Button>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
