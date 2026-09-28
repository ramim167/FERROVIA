import { useCallback, useEffect, useState } from 'react'
import { Icon } from './Icons'
import { api } from '../lib/api'

function createdDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AdminOperatorApprovals({ user, handleError, setToast }) {
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(false)
  const [approvingId, setApprovingId] = useState(null)

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
    setApprovingId(operator.user_id)
    try {
      await api(`/admin/operators/${operator.user_id}/approve`, { method: 'PATCH' })
      setOperators(current => current.filter(item => item.user_id !== operator.user_id))
      setToast(`${operator.full_name} can now sign in as an operator.`)
    } catch (error) {
      handleError(error)
    } finally {
      setApprovingId(null)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="page">
        <div className="card access-card">
          <Icon name="shield" size={36} />
          <h2>Admin access required</h2>
          <p>Only administrators can approve operator accounts.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page admin-operator-approvals">
      <div className="page-title">
        <span className="eyebrow">ADMIN / ACCOUNTS</span>
        <h1>Operator approvals</h1>
        <p>Verify operator accounts before granting access to the operator console.</p>
      </div>

      <div className="admin-operator-approval-toolbar">
        <span>{operators.length} awaiting approval</span>
        <button className="secondary" onClick={loadOperators} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && operators.length === 0 ? (
        <div className="card empty"><p>Loading operator accounts...</p></div>
      ) : operators.length === 0 ? (
        <div className="card empty">
          <Icon name="check" size={38} />
          <h2>No operator accounts awaiting approval</h2>
        </div>
      ) : (
        <div className="admin-operator-approval-list">
          {operators.map(operator => (
            <article className="card admin-operator-approval-card" key={operator.user_id}>
              <div className="admin-operator-approval-identity">
                <span className="eyebrow">OPERATOR ACCOUNT</span>
                <h2>{operator.full_name}</h2>
                <p>{operator.email}</p>
                {operator.phone && <p>{operator.phone}</p>}
              </div>
              <div className="admin-operator-approval-action">
                <small>Registered {createdDate(operator.created_at)}</small>
                <button
                  className="primary"
                  disabled={approvingId === operator.user_id}
                  onClick={() => approve(operator)}
                >
                  {approvingId === operator.user_id ? 'Approving...' : 'Approve operator'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
