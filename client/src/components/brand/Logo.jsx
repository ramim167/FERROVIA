import { SYMBOL, WORDMARK_PATH } from './marks'

/**
 * FERROVIA logo.
 *  variant: "horizontal" (symbol + wordmark) | "symbol" | "wordmark"
 *  tone:    "auto"  — follows the active theme via CSS tokens
 *           "mono"  — single colour (currentColor), no filled tile
 *           "light" — fixed colours for light backgrounds
 *           "dark"  — fixed colours for dark backgrounds
 */
const TONES = {
  auto: { tile: 'var(--logo-tile)', rail: 'var(--logo-rail)', accent: 'var(--logo-accent)', text: 'var(--logo-text)' },
  light: { tile: '#0b5d46', rail: '#ffffff', accent: '#f2b544', text: '#10201b' },
  dark: { tile: '#17926d', rail: '#ffffff', accent: '#f2b544', text: '#eef6f1' },
  mono: { tile: 'none', rail: 'currentColor', accent: 'currentColor', text: 'currentColor' },
}

export function SymbolMark({ tone = 'auto', animated = false }) {
  const c = TONES[tone] || TONES.auto
  const mono = tone === 'mono'
  const ring = ([cx, cy, r]) => (
    <circle cx={cx} cy={cy} r={r} fill={mono ? 'none' : c.tile} stroke={c.rail} strokeWidth="2.6" />
  )
  return (
    <g className={animated ? 'logo-symbol is-animated' : 'logo-symbol'}>
      {!mono && <rect width="48" height="48" rx="13" fill={c.tile} />}
      {mono && <rect x="1.5" y="1.5" width="45" height="45" rx="12" fill="none" stroke="currentColor" strokeWidth="2.4" />}
      <path className="logo-stem" d={SYMBOL.stem} fill="none" stroke={c.rail} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
      <path className="logo-branch" d={SYMBOL.branch} fill="none" stroke={c.rail} strokeWidth="4.2" strokeLinecap="round" pathLength="1" />
      <g className="logo-node logo-node-origin">{ring(SYMBOL.origin)}</g>
      <g className="logo-node logo-node-junction">{ring(SYMBOL.junction)}</g>
      <circle className="logo-node logo-node-destination" cx={SYMBOL.destination[0]} cy={SYMBOL.destination[1]} r={SYMBOL.destination[2]} fill={c.accent} />
    </g>
  )
}

export default function Logo({ variant = 'horizontal', tone = 'auto', className = '', title = 'FERROVIA', animated = false, height }) {
  const c = TONES[tone] || TONES.auto
  const style = height ? { height } : undefined
  if (variant === 'symbol') {
    return (
      <svg className={`logo logo-symbol-only ${className}`} viewBox="0 0 48 48" role="img" aria-label={title} style={style}>
        <SymbolMark tone={tone} animated={animated} />
      </svg>
    )
  }
  if (variant === 'wordmark') {
    return (
      <svg className={`logo logo-wordmark ${className}`} viewBox="1.4 -0.3 112 15" role="img" aria-label={title} style={style}>
        <path d={WORDMARK_PATH} fill={c.text} />
      </svg>
    )
  }
  return (
    <svg className={`logo logo-horizontal ${className}`} viewBox="0 0 190 48" role="img" aria-label={title} style={style}>
      <SymbolMark tone={tone} animated={animated} />
      <g className="logo-word" transform="translate(58.4 15.74) scale(1.15)">
        <path d={WORDMARK_PATH} fill={c.text} />
      </g>
    </svg>
  )
}
