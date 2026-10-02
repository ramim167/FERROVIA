import { Icon } from '../Icons'
import { Spinner } from './Feedback'

/**
 * Button — the single button primitive.
 * variant: primary | secondary | tertiary | ghost | danger | success | inverse
 * size:    sm | md | lg
 * The loading state keeps the button's width, announces "busy" and blocks
 * repeat clicks; the label stays visible to sighted users and readers.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  loadingText,
  block = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, block && 'btn-block', loading && 'is-loading', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Spinner size={size === 'sm' ? 14 : 16} /> : icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
      {(loading && loadingText) || children ? <span className="btn-label">{loading && loadingText ? loadingText : children}</span> : null}
      {!loading && iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 18} className="btn-icon-right" />}
    </button>
  )
}

/** Icon-only control. `label` is required: it becomes the accessible name and tooltip. */
export function IconButton({ icon, label, size = 'md', variant = 'ghost', badge, className = '', type = 'button', ...props }) {
  return (
    <button type={type} className={`icon-btn icon-btn-${variant} icon-btn-${size} ${className}`} aria-label={label} title={label} {...props}>
      <Icon name={icon} size={size === 'sm' ? 16 : 19} />
      {badge ? <span className="icon-btn-badge" aria-hidden="true">{badge}</span> : null}
    </button>
  )
}
