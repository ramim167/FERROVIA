// Shared formatting helpers. Behaviour is identical to the helpers that
// previously lived at the top of App.jsx; they are centralised so every page
// renders times, fares and statuses the same way.

export const pad = (n) => String(n).padStart(2, '0')

export const localToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

export const money = (n) =>
  `৳${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export const fmtTime = (v) =>
  v
    ? new Date(v).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Dhaka',
      })
    : '—'

export const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Dhaka',
      })
    : '—'

export const fmtWeekday = (v) =>
  v ? new Date(v).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'Asia/Dhaka' }) : ''

export const fmtDateTime = (v) =>
  v
    ? new Date(v).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Dhaka',
      })
    : '—'

/** Formats a yyyy-mm-dd search date without timezone drift. */
export const fmtSearchDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const durationText = (a, b) => {
  if (!a || !b) return '—'
  const m = Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000))
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

export const delayText = (n) => (Number(n) > 0 ? `${n} min late` : 'On time')

export const roleLabel = (r) =>
  r ? String(r).charAt(0) + String(r).slice(1).toLowerCase() : 'Passenger'

export const relativeTime = (v) => {
  if (!v) return ''
  const diff = (Date.now() - new Date(v).getTime()) / 1000
  if (!Number.isFinite(diff)) return ''
  if (diff < 45) return 'Just now'
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`
  if (diff < 86400) return `${Math.round(diff / 3600)} h ago`
  if (diff < 86400 * 7) return `${Math.round(diff / 86400)} d ago`
  return fmtDate(v)
}

/** Title-cases backend enum values for display only (never sent back). */
export const humanize = (v) =>
  v ? String(v).replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '—'

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
