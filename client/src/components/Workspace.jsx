import { useEffect, useState } from 'react'
import { Icon } from './Icons'
import Logo from './brand/Logo'
import { Drawer } from './ui/Overlay'
import { WORKSPACE_NAV } from '../lib/roles'
import { initials } from '../lib/format'
import { api } from '../lib/api'

function NavGroups({ groups, page, navigate, collapsed, counts = {} }) {
  return groups.map(({ group, items }) => (
    <div className="ws-group" key={group}>
      <span className="ws-group-label">{group}</span>
      {items.map(([key, label, icon]) => (
        <button
          key={key}
          type="button"
          className={`ws-link ${page === key ? 'is-active' : ''}`}
          aria-current={page === key ? 'page' : undefined}
          title={collapsed ? label : undefined}
          onClick={() => navigate(key)}
        >
          <Icon name={icon} size={19} />
          <span className="ws-link-label">{label}</span>
          {!collapsed && counts[key] != null && <span className="badge badge-neutral ws-count" aria-label={`${counts[key]} pending`}>{counts[key]}</span>}
        </button>
      ))}
    </div>
  ))
}

/**
 * Operator/Admin workspace layout: collapsible sidebar on desktop, a section
 * bar + drawer on tablet and mobile. Navigation entries come from lib/roles.
 */
export default function Workspace({ user, page, navigate, children }) {
  const groups = WORKSPACE_NAV[user?.role] || []
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ferrovia-sidebar') === 'collapsed')
  const [drawer, setDrawer] = useState(false)
  const [counts, setCounts] = useState({})
  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    let active = true
    const refresh = async () => {
      const values = await Promise.allSettled([api('/admin/cancellation-requests'), api('/admin/operators/pending')])
      if (active) setCounts(Object.fromEntries(values.flatMap((value, i) => value.status === 'fulfilled' ? [[['admin-cancellations', 'admin-operator-approvals'][i], value.value.length]] : [])))
    }
    refresh()
    window.addEventListener('ferrovia:reviews-changed', refresh)
    return () => { active = false; window.removeEventListener('ferrovia:reviews-changed', refresh) }
  }, [page, user?.role])
  useEffect(() => { localStorage.setItem('ferrovia-sidebar', collapsed ? 'collapsed' : 'expanded') }, [collapsed])
  const current = groups.flatMap((g) => g.items).find(([key]) => key === page)
  const roleName = user?.role === 'ADMIN' ? 'Administrator' : 'Operator'
  const go = (key) => { setDrawer(false); navigate(key) }

  return (
    <div className={`workspace ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className="ws-sidebar" aria-label={`${roleName} navigation`}>
        <div className="ws-sidebar-head">
          <span className="ws-role"><span className="ws-role-dot" />{user?.role === 'ADMIN' ? 'Admin workspace' : 'Operator console'}</span>
          <button type="button" className="icon-btn icon-btn-sm ws-collapse" onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}>
            <Icon name="sidebar" size={18} />
          </button>
        </div>
        <nav className="ws-nav"><NavGroups groups={groups} page={page} navigate={go} collapsed={collapsed} counts={counts} /></nav>
        <div className="ws-sidebar-foot">
          <button type="button" className="ws-link" onClick={() => go('home')} title={collapsed ? 'Passenger site' : undefined}>
            <Icon name="arrowLeft" size={19} /><span className="ws-link-label">Passenger site</span>
          </button>
          <div className="ws-user">
            <span className="avatar">{initials(user?.full_name)}</span>
            <span className="ws-user-copy"><b>{user?.full_name}</b><small>{roleName}</small></span>
          </div>
        </div>
      </aside>

      <div className="ws-mobilebar">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDrawer(true)} aria-expanded={drawer}>
          <Icon name="sidebar" size={17} /> Sections
        </button>
        <span className="ws-mobilebar-title"><span className="ws-role-dot" />{current?.[1] || roleName}</span>
      </div>

      <div className="ws-main">{children}</div>

      {drawer && (
        <Drawer title={<Logo variant="horizontal" />} side="left" onClose={() => setDrawer(false)} className="ws-drawer">
          <span className="ws-role"><span className="ws-role-dot" />{user?.role === 'ADMIN' ? 'Admin workspace' : 'Operator console'}</span>
          <nav className="ws-nav"><NavGroups groups={groups} page={page} navigate={go} counts={counts} /></nav>
          <button type="button" className="ws-link" onClick={() => go('home')}><Icon name="arrowLeft" size={19} /><span className="ws-link-label">Passenger site</span></button>
        </Drawer>
      )}
    </div>
  )
}
