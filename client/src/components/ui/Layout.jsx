import { useLayoutEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'

/** Page header: optional breadcrumb trail, title, description and actions. */
export function PageHeader({ overline, title, description, actions, crumbs, children, className = '' }) {
  return (
    <header className={`page-header ${className}`}>
      <div className="page-header-copy">
        {crumbs?.length ? (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={crumb}>
                {i > 0 && <Icon name="chevron" size={13} />}
                <span aria-current={i === crumbs.length - 1 ? 'page' : undefined}>{crumb}</span>
              </span>
            ))}
          </nav>
        ) : overline ? (
          <span className="page-overline">{overline}</span>
        ) : null}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}

export function SectionHeader({ title, description, actions, icon, as: Tag = 'h2' }) {
  return (
    <div className="section-header">
      <div className="section-header-copy">
        {icon && <span className="section-header-icon"><Icon name={icon} size={18} /></span>}
        <div>
          <Tag>{title}</Tag>
          {description && <p>{description}</p>}
        </div>
      </div>
      {actions && <div className="section-header-actions">{actions}</div>}
    </div>
  )
}

export function StatCard({ icon, label, value, hint, tone = 'brand', onClick }) {
  const Tag = onClick ? 'button' : 'article'
  return (
    <Tag type={onClick ? 'button' : undefined} className={`stat-card tone-${tone} ${onClick ? 'is-interactive' : ''}`} onClick={onClick}>
      <span className="stat-card-icon"><Icon name={icon} size={19} /></span>
      <span className="stat-card-label">{label}</span>
      <strong className="stat-card-value t-num">{value}</strong>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </Tag>
  )
}

/**
 * Tabs with a sliding indicator. `tabs` = [{ id, label, icon?, count? }].
 * Arrow keys move between tabs (roving tabindex, WAI-ARIA tabs pattern).
 */
export function Tabs({ tabs, value, onChange, label = 'Sections', className = '', id = 'sections' }) {
  const listRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  useLayoutEffect(() => {
    const measure = () => {
      const el = listRef.current?.querySelector('[aria-selected="true"]')
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(listRef.current)
    return () => observer.disconnect()
  }, [value, tabs.length])
  const onKeyDown = (event) => {
    const index = tabs.findIndex((t) => t.id === value)
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    onChange(tabs[next].id)
    requestAnimationFrame(() => listRef.current?.querySelector('[aria-selected="true"]')?.focus())
  }
  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-list" role="tablist" aria-label={label} ref={listRef} onKeyDown={onKeyDown}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${id}-tab-${tab.id}`}
            aria-controls={`${id}-panel`}
            aria-selected={tab.id === value}
            tabIndex={tab.id === value ? 0 : -1}
            className="tab"
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <Icon name={tab.icon} size={16} />}
            <span>{tab.label}</span>
            {tab.count != null && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
        <span className="tabs-indicator" style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} aria-hidden="true" />
      </div>
    </div>
  )
}
