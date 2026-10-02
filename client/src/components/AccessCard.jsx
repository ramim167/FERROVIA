import { EmptyState } from './ui/Feedback'
import { Button } from './ui/Button'

export default function AccessCard({ title, copy, action, onAction, icon = 'lock' }) {
  return (
    <main className="page page-enter">
      <div className="card access-card">
        <EmptyState icon={icon} title={title} description={copy} action={action && <Button onClick={onAction}>{action}</Button>} />
      </div>
    </main>
  )
}

