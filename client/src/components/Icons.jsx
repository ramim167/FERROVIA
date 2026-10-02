// FERROVIA icon set: one line family on a 24px grid, round caps and joins.
// Icons are decorative by default (aria-hidden); pair them with visible text
// or an aria-label on the parent control.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

const icons = {
  home: <><path d="m3 11 9-7.5 9 7.5" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5.5h4V20" /></>,
  seat: <><path d="M7 4.5h7a2 2 0 0 1 2 2V13H7z" /><path d="M5 10.5V17h14v-6.5" /><path d="M7 17v3.5M17 17v3.5" /></>,
  ticket: <><path d="M3.5 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2.2a2.3 2.3 0 0 0 0 4.6v2.2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-2.2a2.3 2.3 0 0 0 0-4.6Z" /><path d="M14.5 5.5v2M14.5 11v2M14.5 16.5v2" /></>,
  support: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.3a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.3 1-1.3 1.9" /><path d="M12 16.8h.01" /></>,
  bot: <><path d="M12 3.5V6" /><rect x="4.5" y="6" width="15" height="12" rx="4" /><path d="M9 11.5v1M15 11.5v1" /><path d="M9.5 15.5h5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" /></>,
  mapPin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.4" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M16 3v4M8 3v4M3.5 10h17" /></>,
  swap: <><path d="M7 4 3.5 7.5 7 11" /><path d="M3.5 7.5h13" /><path d="m17 13 3.5 3.5L17 20" /><path d="M20.5 16.5h-13" /></>,
  arrow: <><path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" /></>,
  arrowLeft: <><path d="M19 12H5M10.5 6.5 5 12l5.5 5.5" /></>,
  train: <><rect x="5.5" y="3" width="13" height="14" rx="3.5" /><path d="M5.5 11h13" /><path d="M9 14.2h.01M15 14.2h.01" /><path d="M8.5 17 6.5 21M15.5 17l2 4" /></>,
  route: <><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" /><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" /></>,
  rails: <><path d="M8 3 6 21M16 3l2 18" /><path d="M7.4 7h9.2M6.9 12h10.2M6.4 17h11.2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>,
  chevron: <><path d="m9.5 18 6-6-6-6" /></>,
  chevronLeft: <><path d="m14.5 18-6-6 6-6" /></>,
  chevronDown: <><path d="m6 9.5 6 6 6-6" /></>,
  shield: <><path d="M12 21.5s7.5-3.6 7.5-9.4V5.6L12 3 4.5 5.6v6.5c0 5.8 7.5 9.4 7.5 9.4Z" /><path d="m9 12 2.1 2.1L15.2 10" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><path d="M12 14.5v2" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 6.5-2.5 8-2.5 8h17S18 15.5 18 9" /><path d="M10.2 20.5a2 2 0 0 0 3.6 0" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>,
  moon: <><path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a7.5 7.5 0 1 0 10.8 10.8Z" /></>,
  heart: <><path d="M20.3 5.2a5 5 0 0 0-7.1 0L12 6.4l-1.2-1.2a5 5 0 0 0-7.1 7.1l1.2 1.2L12 20.6l7.1-7.1 1.2-1.2a5 5 0 0 0 0-7.1Z" /></>,
  filter: <><path d="M4 6.5h16M7 12h10M10 17.5h4" /></>,
  sliders: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  chart: <><path d="M4 20V11M10 20V5M16 20v-6" /><path d="M21 20H3" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.2M12 7.8h.01" /></>,
  alert: <><path d="M10.3 4.2 2.8 17.5a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4.2M12 16.8h.01" /></>,
  print: <><path d="M6.5 9V3.5h11V9" /><path d="M6.5 17.5h-2a2 2 0 0 1-2-2v-4.5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2h-2" /><rect x="6.5" y="14" width="11" height="7" rx="1" /></>,
  download: <><path d="M12 3.5v11.5M7 10l5 5 5-5" /><path d="M4.5 20.5h15" /></>,
  close: <><path d="M18 6 6 18M6 6l12 12" /></>,
  logout: <><path d="M15 16.5 19.5 12 15 7.5M19.5 12H9" /><path d="M12 20.5H6.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H12" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  sidebar: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  trash: <><path d="M4 6.5h16M9 6.5V4.5h6v2M18.5 6.5l-.9 13a1.5 1.5 0 0 1-1.5 1.4H7.9a1.5 1.5 0 0 1-1.5-1.4l-.9-13" /><path d="M10 11v5.5M14 11v5.5" /></>,
  check: <><path d="m5 12.5 4.2 4.2L19 7" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12.3 2.8 2.8L16.2 9.6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  refresh: <><path d="M20 11.5A8 8 0 0 0 6 6.3L4 8.5" /><path d="M4 4v4.5h4.5" /><path d="M4 12.5a8 8 0 0 0 14 5.2l2-2.2" /><path d="M20 20v-4.5h-4.5" /></>,
  copy: <><rect x="8.5" y="8.5" width="12" height="12" rx="2.5" /><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2Z" /></>,
  phone: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.8" /><path d="M10.5 18.5h3" /></>,
  card: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 9.5h19M6.5 15h4" /></>,
  bank: <><path d="m3 9 9-5.5L21 9H3Z" /><path d="M3.5 20.5h17M5.5 12v5.5M10 12v5.5M14 12v5.5M18.5 12v5.5" /></>,
  wallet: <><path d="M19.5 8V6a2 2 0 0 0-2-2H5a2.5 2.5 0 0 0 0 5h14.5a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5H5a2.5 2.5 0 0 1-2.5-2.5v-11" /><path d="M16.5 14.5h.01" /></>,
  receipt: <><path d="M5.5 3.5h13v17l-2.2-1.4-2.1 1.4-2.2-1.4-2.2 1.4-2.1-1.4-2.2 1.4Z" /><path d="M9 8.5h6M9 12h6M9 15.5h3.5" /></>,
  layers: <><path d="m12 3.5 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  userCheck: <><circle cx="9" cy="8" r="3.8" /><path d="M2 20.5a7 7 0 0 1 12.2-4.6" /><path d="m15.5 17.5 2 2 4-4" /></>,
  undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>,
  signal: <><path d="M12 21V10" /><circle cx="12" cy="7" r="2.5" /><path d="M7.5 3.5a6.3 6.3 0 0 0 0 7M16.5 3.5a6.3 6.3 0 0 1 0 7" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4.5h11l-2 4 2 4H5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
}

export function Icon({ name, size = 20, className = '', strokeWidth, title }) {
  const props = { ...base, width: size, height: size, className: `icon ${className}`.trim() }
  if (strokeWidth) props.strokeWidth = strokeWidth
  if (title) {
    props['aria-hidden'] = undefined
    props.role = 'img'
    props['aria-label'] = title
  }
  return <svg {...props}>{icons[name] || icons.info}</svg>
}
