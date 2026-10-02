import { Icon } from '../Icons'
import { humanize } from '../../lib/format'

export function Spinner({ size = 16, label }) {
  return (
    <span className="spinner" style={{ '--spinner-size': `${size}px` }} role={label ? 'status' : undefined} aria-label={label}>
      <span aria-hidden="true" />
    </span>
  )
}

export function Skeleton({ width = '100%', height = 14, radius, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ width, height, borderRadius: radius }} aria-hidden="true" />
}

/** Skeleton shaped like a journey result card. */
export function SkeletonJourney() {
  return (
    <div className="card skeleton-journey" aria-hidden="true">
      <div className="row-between"><Skeleton width="38%" height={18} /><Skeleton width={84} height={24} radius={999} /></div>
      <div className="skeleton-journey-line">
        <Skeleton width={72} height={30} /><span className="skeleton-rail" /><Skeleton width={72} height={30} />
      </div>
      <div className="skeleton-journey-classes"><Skeleton height={58} radius={12} /><Skeleton height={58} radius={12} /><Skeleton height={58} radius={12} /></div>
    </div>
  )
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i}>
          <Skeleton width={36} height={36} radius={10} />
          <div className="grow stack-sm"><Skeleton width={`${60 - i * 6}%`} height={13} /><Skeleton width="34%" height={11} /></div>
          <Skeleton width={70} height={22} radius={999} />
        </div>
      ))}
    </div>
  )
}

/** A small FERROVIA-style illustration: a rail line running to a station node. */
function EmptyArt({ icon }) {
  return (
    <div className="empty-art" aria-hidden="true">
      <svg viewBox="0 0 160 72" fill="none">
        <path className="empty-art-rail" d="M6 52h56c10 0 14-6 18-12s8-12 18-12h56" />
        <path className="empty-art-rail empty-art-rail-2" d="M6 60h56c12 0 16-7 20-13.5S90 34 100 34h54" />
        <circle className="empty-art-node" cx="6" cy="56" r="4.5" />
        <circle className="empty-art-node is-end" cx="154" cy="31" r="5.5" />
      </svg>
      <span className="empty-art-icon"><Icon name={icon} size={24} /></span>
    </div>
  )
}

export function EmptyState({ icon = 'route', title, description, action, secondaryAction, compact = false, className = '' }) {
  return (
    <div className={`empty-state ${compact ? 'is-compact' : ''} ${className}`}>
      <EmptyArt icon={icon} />
      <h2 className="empty-state-title">{title}</h2>
      {description && <p className="empty-state-text">{description}</p>}
      {(action || secondaryAction) && <div className="empty-state-actions">{secondaryAction}{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'This information did not load', description, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-state-icon"><Icon name="alert" size={22} /></span>
      <div className="grow">
        <b>{title}</b>
        {description && <p>{description}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          <Icon name="refresh" size={16} /> <span className="btn-label">{retryLabel}</span>
        </button>
      )}
    </div>
  )
}

/** Generic badge. tone: neutral | brand | success | warning | danger | info | accent */
export function Badge({ tone = 'neutral', dot = false, pulse = false, children, className = '' }) {
  return (
    <span className={`badge badge-${tone} ${className}`}>
      {dot && <span className={`badge-dot ${pulse ? 'is-pulsing' : ''}`} aria-hidden="true" />}
      {children}
    </span>
  )
}

const STATUS_TONES = {
  CONFIRMED: 'success', PAID: 'success', APPROVED: 'success', COMPLETED: 'neutral', ARRIVED: 'success', ACTIVE: 'success', ASSIGNED: 'success', PROCESSED: 'success', REFUNDED: 'success',
  PENDING: 'warning', REQUESTED: 'warning', HELD: 'warning', BOARDING: 'info', SCHEDULED: 'info', SPARE: 'brand', RESERVED: 'info',
  RUNNING: 'accent', DEPARTED: 'accent', IN_SERVICE: 'accent', DELAYED: 'danger', LATE: 'danger',
  CANCELLED: 'danger', REJECTED: 'danger', EXPIRED: 'neutral', INACTIVE: 'neutral', MAINTENANCE: 'warning', OUT_OF_SERVICE: 'danger', CLOSED: 'neutral',
}

/** Status badge for backend enum values. Displays humanized text; the raw value is never altered. */
export function StatusBadge({ status, label, className = '' }) {
  const key = String(status || '').toUpperCase()
  const tone = STATUS_TONES[key] || 'neutral'
  const live = key === 'RUNNING' || key === 'DEPARTED' || key === 'BOARDING'
  return (
    <Badge tone={tone} dot pulse={live} className={className}>
      {label || humanize(status)}
    </Badge>
  )
}

export function DelayBadge({ minutes }) {
  const late = Number(minutes) > 0
  return (
    <Badge tone={late ? 'danger' : 'success'} dot>
      {late ? `${minutes} min late` : 'On time'}
    </Badge>
  )
}
