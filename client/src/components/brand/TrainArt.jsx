import { useId } from 'react'
import { SYMBOL, WORDMARK_PATH } from './marks'

/*
 * FERROVIA intercity trainset, side elevation, facing right.
 * Built from primitives so it stays crisp at any size and weighs a few KB.
 * Livery: pearl body, bottle-green band, signal-amber pinstripe.
 * Cabin windows are lit for the dusk scenes used by the intro and hero.
 */

const COACH_W = 300
const GAP = 10
const LOCO_W = 352

function Wheel({ cx, cy = 106, gid }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r="10.5" fill={`url(#${gid}-wheel)`} />
      <g className="train-wheel-spin">
        <circle r="7.2" fill="none" stroke="var(--train-paint-1)" strokeWidth="1.4" />
        <path d="M-7 0H7M0-7V7M-5-5 5 5M-5 5 5-5" stroke="var(--train-paint-2)" strokeWidth="1.1" />
      </g>
      <circle r="2.4" fill="var(--train-paint-3)" />
    </g>
  )
}

function Bogie({ x, gid }) {
  return (
    <g>
      <rect x={x - 30} y="94" width="60" height="9" rx="3" fill="var(--train-paint-4)" />
      <rect x={x - 24} y="97" width="48" height="4" rx="2" fill="var(--train-paint-5)" />
      <Wheel cx={x - 16} gid={gid} />
      <Wheel cx={x + 16} gid={gid} />
      <path d={`M${x - 6} 100h12`} stroke="var(--train-paint-6)" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

function Coach({ x, gid, index }) {
  const windows = [52, 88, 124, 160, 196, 232]
  return (
    <g transform={`translate(${x} 0)`} className="train-coach">
      {/* roof units */}
      <rect x="70" y="13" width="54" height="9" rx="3.5" fill="var(--train-paint-7)" />
      <rect x="176" y="13" width="54" height="9" rx="3.5" fill="var(--train-paint-7)" />
      <path d="M78 16h38M184 16h38" stroke="var(--train-paint-8)" strokeWidth="1" />
      {/* body */}
      <rect x="0" y="20" width={COACH_W} height="74" rx="11" fill={`url(#${gid}-body)`} />
      <rect x="0" y="20" width={COACH_W} height="7" rx="3.5" fill="var(--train-paint-9)" opacity=".75" />
      {/* livery */}
      <rect x="0" y="66" width={COACH_W} height="14" fill={`url(#${gid}-band)`} />
      <rect x="0" y="81" width={COACH_W} height="2.4" fill="var(--train-paint-10)" />
      {/* windows */}
      {windows.map((wx) => (
        <g key={wx}>
          <rect x={wx} y="35" width="28" height="21" rx="4.5" fill="var(--train-paint-11)" />
          <rect x={wx + 1.5} y="36.5" width="25" height="18" rx="3.4" fill={`url(#${gid}-glass)`} className="train-window" />
          <path d={`M${wx + 4} 52.5 ${wx + 15} 38.5h5l-11 14Z`} fill="var(--train-paint-12)" opacity=".12" />
        </g>
      ))}
      {/* doors */}
      {[14, 266].map((dx) => (
        <g key={dx}>
          <rect x={dx} y="30" width="22" height="58" rx="3" fill="none" stroke="var(--train-paint-13)" strokeWidth="1.3" />
          <rect x={dx + 5} y="36" width="12" height="17" rx="2.5" fill={`url(#${gid}-glass)`} className="train-window is-door" />
          <path d={`M${dx + 11} 31v56`} stroke="var(--train-paint-13)" strokeWidth="1" />
        </g>
      ))}
      <text x="150" y="76.6" textAnchor="middle" fontSize="7.2" fontWeight="800" letterSpacing="2.4" fill="var(--train-paint-14)" opacity=".9" fontFamily="Manrope Variable, Manrope, sans-serif">
        {['S', 'CH', 'AC'][index % 3]}
      </text>
      {/* underframe */}
      <rect x="10" y="92" width={COACH_W - 20} height="5" fill="var(--train-paint-15)" />
      <rect x="100" y="94" width="40" height="7" rx="2" fill="var(--train-paint-16)" />
      <rect x="160" y="94" width="28" height="7" rx="2" fill="var(--train-paint-16)" />
      <Bogie x={52} gid={gid} />
      <Bogie x={COACH_W - 52} gid={gid} />
      {/* gangway */}
      <rect x={COACH_W - 1} y="34" width={GAP + 2} height="50" rx="2" fill="var(--train-paint-17)" />
    </g>
  )
}

function Locomotive({ x, gid }) {
  const nose = 'M0 20H236C268 20 292 30 314 52L344 84C350 90 348 94 340 94H0Z'
  return (
    <g transform={`translate(${x} 0)`} className="train-loco">
      {/* roof equipment */}
      <rect x="40" y="12" width="96" height="10" rx="4" fill="var(--train-paint-18)" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${50 + i * 12} 14v6`} stroke="var(--train-paint-19)" strokeWidth="1.4" />)}
      <rect x="150" y="14" width="44" height="8" rx="3" fill="var(--train-paint-7)" />
      {/* body */}
      <path d={nose} fill={`url(#${gid}-body)`} />
      <path d="M0 20H236C252 20 266 23 279 28H0Z" fill="var(--train-paint-20)" opacity=".7" />
      {/* livery band sweeps up the nose */}
      <path d="M0 66H322L336 80H0Z" fill={`url(#${gid}-band)`} />
      <path d="M0 81H337.6L340 83.4H0Z" fill="var(--train-paint-10)" />
      {/* windscreen */}
      <path d="M248 30C270 31 288 40 302 56L290 60H250Z" fill="var(--train-paint-21)" />
      <path d="M251 33C268 34 283 41 295 55L288 57.5H253Z" fill={`url(#${gid}-screen)`} />
      <path d="M262 35 280 37 268 56h-7Z" fill="var(--train-paint-12)" opacity=".14" />
      {/* cab side window + door */}
      <rect x="206" y="34" width="26" height="20" rx="4" fill={`url(#${gid}-glass)`} className="train-window is-cab" />
      <rect x="200" y="29" width="38" height="59" rx="3" fill="none" stroke="var(--train-paint-13)" strokeWidth="1.3" />
      <path d="M232 62h-6" stroke="var(--train-paint-22)" strokeWidth="2" strokeLinecap="round" />
      {/* engine louvres */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={28 + i * 15} y="34" width="9" height="24" rx="2" fill="var(--train-paint-23)" opacity=".55" />
      ))}
      <rect x="22" y="31" width="146" height="30" rx="4" fill="none" stroke="var(--train-paint-24)" strokeWidth="1" />
      {/* brand on the band */}
      <g transform="translate(26 68.6) scale(.62)">
        <rect width="15" height="15" rx="4" fill="var(--train-paint-25)" />
        <g transform="scale(.3125)">
          <path d={SYMBOL.stem} fill="none" stroke="var(--train-paint-12)" strokeWidth="5" strokeLinecap="round" />
          <path d={SYMBOL.branch} fill="none" stroke="var(--train-paint-12)" strokeWidth="5" strokeLinecap="round" />
          <circle cx={SYMBOL.destination[0]} cy={SYMBOL.destination[1]} r="4.5" fill="var(--train-paint-26)" />
        </g>
      </g>
      <g transform="translate(40 70.4) scale(.56)" fill="var(--train-paint-27)">
        <path d={WORDMARK_PATH} />
      </g>
      {/* lamps */}
      <path d="M326 76h10l4 4h-14Z" fill="var(--train-paint-12)6dc" className="train-headlamp" />
      <circle cx="318" cy="88" r="2.2" fill="var(--train-paint-29)" opacity=".85" />
      {/* cowcatcher + underframe */}
      <path d="M300 94H344L352 101H296Z" fill="var(--train-paint-15)" />
      <rect x="10" y="92" width="290" height="5" fill="var(--train-paint-15)" />
      <rect x="120" y="94" width="70" height="8" rx="2" fill="var(--train-paint-16)" />
      <Bogie x={62} gid={gid} />
      <Bogie x={262} gid={gid} />
    </g>
  )
}

export default function TrainArt({ coaches = 3, className = '', lit = true, beam = true, title }) {
  const gid = `t${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const width = coaches * (COACH_W + GAP) + LOCO_W + (beam ? 260 : 8)
  return (
    <svg
      className={`train-art ${lit ? 'is-lit' : ''} ${className}`}
      viewBox={`0 0 ${width} 118`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMinYMid meet"
    >
      <defs>
        <linearGradient id={`${gid}-body`} x1="0" y1="20" x2="0" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--train-paint-30)" />
          <stop offset=".55" stopColor="var(--train-paint-31)" />
          <stop offset="1" stopColor="var(--train-paint-32)" />
        </linearGradient>
        <linearGradient id={`${gid}-band`} x1="0" y1="66" x2="0" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--train-paint-33)" />
          <stop offset="1" stopColor="var(--train-paint-34)" />
        </linearGradient>
        <linearGradient id={`${gid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--train-window-top)" />
          <stop offset="1" stopColor="var(--train-window-bottom)" />
        </linearGradient>
        <linearGradient id={`${gid}-screen`} x1="250" y1="33" x2="296" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--train-paint-35)" />
          <stop offset="1" stopColor="var(--train-paint-36)" />
        </linearGradient>
        <radialGradient id={`${gid}-wheel`}>
          <stop offset=".6" stopColor="var(--train-paint-37)" />
          <stop offset="1" stopColor="var(--train-paint-38)" />
        </radialGradient>
        <linearGradient id={`${gid}-beam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--train-paint-12)3cf" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--train-paint-12)3cf" stopOpacity="0" />
        </linearGradient>
      </defs>
      {beam && (
        <path
          className="train-beam"
          d={`M${coaches * (COACH_W + GAP) + 340} 78 L${width} 54 L${width} 104 Z`}
          fill={`url(#${gid}-beam)`}
        />
      )}
      {Array.from({ length: coaches }, (_, i) => (
        <Coach key={i} x={i * (COACH_W + GAP)} gid={gid} index={i} />
      ))}
      <Locomotive x={coaches * (COACH_W + GAP)} gid={gid} />
    </svg>
  )
}
