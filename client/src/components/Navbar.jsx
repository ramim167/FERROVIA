import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icons'
import Logo from './brand/Logo'
import { Drawer } from './ui/Overlay'
import { initials, relativeTime } from '../lib/format'
import { WORKSPACE_PAGES, workspaceFor } from '../lib/roles'

const PUBLIC_LINKS = [
  ['home', 'Home', 'home'],
  ['search', 'Book tickets', 'ticket'],
  ['track', 'Track a train', 'signal'],
  ['tickets', 'My tickets', 'wallet'],
  ['support', 'Help', 'support'],
]

function useOutside(ref, open, close) {
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!ref.current?.contains(e.target)) close() }
    const onKey = (e) => { if (e.key === 'Escape') { close(); ref.current?.querySelector('button')?.focus() } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [ref, open, close])
}

function usePopoverFocus(ref, open, menu = false) {
  useEffect(() => {
    if (!open) return
    const trigger = ref.current?.querySelector('button')
    const panel = ref.current?.querySelector('.menu')
    const items = () => [...panel.querySelectorAll(menu ? '[role="menuitem"]' : 'button')]
    const focus = (index) => {
      const buttons = items()
      if (menu) buttons.forEach((el, i) => { el.tabIndex = i === index ? 0 : -1 })
      buttons[index]?.focus()
    }
    focus(0)
    const keys = (event) => {
      if (!menu) return
      const buttons = items(), index = buttons.indexOf(document.activeElement)
      const next = event.key === 'ArrowDown' ? (index + 1) % buttons.length : event.key === 'ArrowUp' ? (index - 1 + buttons.length) % buttons.length : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null
      if (next != null) { event.preventDefault(); focus(next) }
    }
    panel.addEventListener('keydown', keys)
    return () => { panel.removeEventListener('keydown', keys); if (document.activeElement === document.body || panel.contains(document.activeElement)) trigger?.focus() }
  }, [ref, open, menu])
}

function NotificationCenter({ user, notifications, unread, navigate, onAuth, onMarkAllRead }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOutside(ref, open, () => setOpen(false))
  usePopoverFocus(ref, open)
  const latest = notifications.slice(0, 5)
  return (
    <div className="nav-pop" ref={ref}>
      <button
        type="button"
        className="icon-btn nav-icon"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={user ? open : undefined}
        onClick={() => (user ? setOpen((v) => !v) : onAuth())}
      >
        <Icon name="bell" size={19} />
        {unread > 0 && <span className="icon-btn-badge" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="menu notif-menu" role="dialog" aria-label="Recent notifications">
          <div className="notif-menu-head">
            <b>Notifications</b>
            {unread > 0 && <button type="button" className="link-btn" onClick={onMarkAllRead}>Mark all read</button>}
          </div>
          {latest.length ? (
            <ul className="notif-menu-list">
              {latest.map((n) => (
                <li key={n.notification_id}>
                  <button type="button" className={Number(n.is_read) ? '' : 'is-unread'} onClick={() => { setOpen(false); navigate('notifications') }}>
                    <span className="notif-dot" aria-hidden="true" />
                    <span className="grow">
                      <b>{n.title}</b>
                      <span>{n.message}</span>
                      <small>{relativeTime(n.created_at)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="notif-menu-empty">You're all caught up. Booking and refund updates will appear here.</p>
          )}
          <button type="button" className="notif-menu-all" onClick={() => { setOpen(false); navigate('notifications') }}>
            View all notifications <Icon name="arrow" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function AccountMenu({ user, navigate, onLogout, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOutside(ref, open, () => setOpen(false))
  usePopoverFocus(ref, open, true)
  const workspace = workspaceFor(user)
  const go = (p) => { setOpen(false); navigate(p) }
  return (
    <div className="nav-pop" ref={ref}>
      <button type="button" className="account-chip" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)}>
        <span className="avatar">{initials(user.full_name)}</span>
        <span className="account-chip-copy">
          <b>{user.full_name?.split(' ')[0]}</b>
          <small>{user.role === 'PASSENGER' ? 'Passenger' : user.role === 'ADMIN' ? 'Administrator' : 'Operator'}</small>
        </span>
        <Icon name="chevronDown" size={16} className="account-chip-caret" />
      </button>
      {open && (
        <div className="menu account-menu" role="menu">
          <div className="menu-header">
            <b>{user.full_name}</b>
            <small>{user.email}</small>
          </div>
          <button role="menuitem" className="menu-item" onClick={() => go('dashboard')}><Icon name="chart" size={17} /> Travel dashboard</button>
          <button role="menuitem" className="menu-item" onClick={() => go('tickets')}><Icon name="wallet" size={17} /> My tickets</button>
          <button role="menuitem" className="menu-item" onClick={() => go('notifications')}><Icon name="bell" size={17} /> Notifications</button>
          {workspace && <button role="menuitem" className="menu-item" onClick={() => go(workspace.page)}><Icon name={workspace.icon} size={17} /> {workspace.label}</button>}
          <div className="menu-sep" />
          <button role="menuitem" className="menu-item" onClick={() => { onToggleTheme(); setOpen(false) }}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} /> {theme === 'dark' ? 'Light appearance' : 'Dark appearance'}
          </button>
          <button role="menuitem" className="menu-item is-danger" onClick={() => { setOpen(false); onLogout() }}><Icon name="logout" size={17} /> Sign out</button>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ page, navigate, user, onAuth, onLogout, notifications = [], notificationCount = 0, onMarkAllRead, theme = 'light', onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const workspace = workspaceFor(user)
  const onStage = page === 'home' && !scrolled
  const inWorkspace = WORKSPACE_PAGES.has(page)
  const go = (p) => { setDrawer(false); navigate(p) }
  const links = [...PUBLIC_LINKS]
  if (user) links.splice(4, 0, ['dashboard', 'Dashboard', 'chart'])

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${onStage ? 'is-on-stage' : ''} ${inWorkspace ? 'is-workspace' : ''}`}>
      <div className="nav-inner">
        <button type="button" className="nav-brand" onClick={() => go('home')} aria-label="FERROVIA home">
          <Logo variant="horizontal" tone={onStage && theme === 'dark' ? 'dark' : 'auto'} />
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          {links.map(([key, label]) => (
            <button key={key} type="button" className={`nav-link ${page === key ? 'is-active' : ''}`} aria-current={page === key ? 'page' : undefined} onClick={() => go(key)}>
              {label}
            </button>
          ))}
          {workspace && (
            <button type="button" className={`nav-link nav-link-workspace ${inWorkspace ? 'is-active' : ''}`} aria-current={inWorkspace ? 'page' : undefined} onClick={() => go(workspace.page)}>
              <Icon name={workspace.icon} size={16} /> {user.role === 'ADMIN' ? 'Admin' : 'Operator'}
            </button>
          )}
        </nav>

        <div className="nav-actions">
          <button type="button" className="icon-btn nav-icon nav-theme" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} appearance`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} appearance`}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
          </button>
          <NotificationCenter user={user} notifications={notifications} unread={notificationCount} navigate={go} onAuth={onAuth} onMarkAllRead={onMarkAllRead} />
          {user ? (
            <AccountMenu user={user} navigate={go} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
          ) : (
            <button type="button" className="btn btn-primary btn-sm nav-signin" onClick={onAuth}>Sign in</button>
          )}
          <button type="button" className="icon-btn nav-icon nav-menu" aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
            <Icon name="menu" size={21} />
          </button>
        </div>
      </div>

      {drawer && (
        <Drawer title="Menu" onClose={() => setDrawer(false)} className="nav-drawer">
          {user && (
            <div className="nav-drawer-user">
              <span className="avatar">{initials(user.full_name)}</span>
              <div><b>{user.full_name}</b><small>{user.email}</small></div>
            </div>
          )}
          <nav className="nav-drawer-links" aria-label="Main navigation">
            {links.map(([key, label, icon]) => (
              <button key={key} type="button" className={page === key ? 'is-active' : ''} aria-current={page === key ? 'page' : undefined} onClick={() => go(key)}>
                <Icon name={icon} size={19} /> {label}
              </button>
            ))}
            {workspace && (
              <button type="button" className={inWorkspace ? 'is-active' : ''} onClick={() => go(workspace.page)}>
                <Icon name={workspace.icon} size={19} /> {workspace.label}
              </button>
            )}
            {user && <button type="button" onClick={() => go('notifications')}><Icon name="bell" size={19} /> Notifications {notificationCount > 0 && <span className="badge badge-accent">{notificationCount}</span>}</button>}
          </nav>
          <div className="nav-drawer-foot">
            <button type="button" className="btn btn-secondary btn-block" onClick={onToggleTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /> {theme === 'dark' ? 'Light appearance' : 'Dark appearance'}
            </button>
            {user ? (
              <button type="button" className="btn btn-danger-soft btn-block" onClick={() => { setDrawer(false); onLogout() }}><Icon name="logout" size={18} /> Sign out</button>
            ) : (
              <button type="button" className="btn btn-primary btn-block" onClick={() => { setDrawer(false); onAuth() }}>Sign in or create account</button>
            )}
          </div>
        </Drawer>
      )}
    </header>
  )
}
