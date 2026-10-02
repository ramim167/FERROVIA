import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useConfirm } from '../lib/confirm'
import { fmtDateTime, initials } from '../lib/format'
import { Icon } from './Icons'
import { Button } from './ui/Button'
import { Badge, EmptyState, SkeletonRows } from './ui/Feedback'
import { PageHeader } from './ui/Layout'

export default function AdminOperatorApprovals({ user, handleError, setToast }) {
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(false)
  const [approvingId, setApprovingId] = useState(null)
  const confirm = useConfirm()

  const loadOperators = useCallback(async () => {
    setLoading(true)
    try {
      setOperators(await api('/admin/operators/pending'))
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [handleError])

  useEffect(() => {
    if (user?.role === 'ADMIN') loadOperators()
  }, [user?.role, loadOperators])

  async function approve(operator) {
    const ok = await confirm({
      tone: 'primary',
      icon: 'userCheck',
      title: `Approve ${operator.full_name}?`,
      description: `${operator.email} will be able to sign in and record station events for trips assigned to them.`,
      confirmLabel: 'Approve operator',
      cancelLabel: 'Not now',
    })
    if (!ok) return
    setApprovingId(operator.user_id)
    try {
      await api(`/admin/operators/${operator.user_id}/approve`, { method: 'PATCH' })
      setOperators((current) => current.filter((item) => item.user_id !== operator.user_id))
      window.dispatchEvent(new Event('ferrovia:reviews-changed'))
      setToast(`${operator.full_name} can now sign in as an operator.`)
    } catch (error) {
      handleError(error)
    } finally {
      setApprovingId(null)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page page-enter">
        <div className="card"><EmptyState icon="lock" title="Admin access required" description="Only administrators can approve operator accounts." /></div>
      </main>
    )
  }

  return (
    <main className="page page-enter ws-page">
      <PageHeader
        crumbs={['Admin', 'Requests', 'Operator approvals']}
        title="Operator approvals"
        description="Verify new operator accounts before they can use the station console."
        actions={<><Badge tone={operators.length ? 'info' : 'neutral'}>{operators.length} awaiting approval</Badge><Button variant="secondary" icon="refresh" onClick={loadOperators} loading={loading}>Refresh</Button></>}
      />

      {loading && operators.length === 0 ? (
        <div className="card"><SkeletonRows rows={3} /></div>
      ) : operators.length === 0 ? (
        <div className="card"><EmptyState icon="userCheck" title="No operator accounts awaiting approval" description="When someone registers as an operator, their account will appear here." /></div>
      ) : (
        <div className="review-list">
          {operators.map((operator) => (
            <article className="card approval-card" key={operator.user_id}>
              <span className="avatar avatar-lg">{initials(operator.full_name)}</span>
              <div className="grow">
                <h2>{operator.full_name}</h2>
                <p className="approval-meta">
                  <span><Icon name="mail" size={15} /> {operator.email}</span>
                  {operator.phone && <span><Icon name="phone" size={15} /> {operator.phone}</span>}
                  <span><Icon name="clock" size={15} /> Registered {fmtDateTime(operator.created_at)}</span>
                </p>
              </div>
              <Button icon="userCheck" loading={approvingId === operator.user_id} loadingText="Approving…" onClick={() => approve(operator)}>
                Approve operator
              </Button>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
