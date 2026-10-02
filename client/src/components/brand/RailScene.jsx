import { useEffect, useRef, useState } from 'react'
import TrainArt from './TrainArt'

/*
 * A layered dusk landscape with a FERROVIA train.
 *  mode "cruise" : camera follows the train, the world scrolls past (parallax)
 *  mode "arrive" : static camera, the train glides in and halts at the platform
 *  mode "idle"   : everything at rest (used for reduced motion)
 * All motion is CSS transforms on composited layers; no canvas, no video.
 */

const Skyline = () => (
  <svg viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
    <path className="scene-hills" d="M0 128C80 104 150 98 230 112S380 132 460 114 610 88 700 104 850 130 940 112 1100 92 1200 116V160H0Z" />
    <g className="scene-city">
      <path d="M520 110V78h14v-9h10v9h12v32ZM566 110V62h18v48ZM590 110V86h22v24ZM618 110V70l11-8 11 8v40ZM646 110V92h26v18Z" />
      <path d="M690 110V84a14 14 0 0 1 28 0v26Zm12-38h4v-8h-4Z" />
      <path d="M730 110V58h16v52ZM752 110V80h24v30ZM782 110V68h12v42ZM800 110V88h30v22Z" />
      <path d="M120 120V96h18v24ZM144 120V104h26v16ZM980 116V90h16v26ZM1002 116V100h28v16Z" />
    </g>
    <g className="scene-windows">
      {[[570, 70], [576, 82], [626, 80], [736, 66], [736, 80], [740, 92], [786, 76], [528, 88], [758, 90]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx=".6" />)}
    </g>
  </svg>
)

const NearLayer = () => (
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
    <g className="scene-palms">
      {[90, 410, 690, 1010].map((x, i) => (
        <g key={x} transform={`translate(${x} 0) scale(${i % 2 ? 0.86 : 1})`}>
          <path d="M0 120C2 92 6 66 14 44" fill="none" strokeWidth="4" strokeLinecap="round" />
          <path d="M14 44c-14-10-30-8-40 2 14-4 26-2 40-2Zm0 0c-6-16-20-22-34-20 12 4 24 10 34 20Zm0 0c4-16 16-24 32-24-12 6-22 14-32 24Zm0 0c14-6 30-2 38 10-14-6-26-8-38-10Zm0 0c10 4 18 14 18 26-6-10-12-18-18-26Z" />
        </g>
      ))}
    </g>
    <g className="scene-posts">
      {[250, 560, 860, 1140].map((x) => (
        <g key={x}><path d={`M${x} 120V58`} strokeWidth="2.4" /><path d={`M${x - 10} 64h20M${x - 8} 72h16`} strokeWidth="1.6" /></g>
      ))}
    </g>
  </svg>
)

export default function RailScene({ mode = 'cruise', className = '', coaches = 3, children }) {
  const root = useRef(null)
  const [arrived, setArrived] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [passing, setPassing] = useState(null)
  const effectiveMode = reduced ? 'idle' : mode === 'arrive' && arrived ? 'ambient' : mode

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    let visible = true
    const update = () => setPaused(!visible || document.hidden)
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() })
    observer.observe(root.current)
    document.addEventListener('visibilitychange', update)
    update()
    return () => { observer.disconnect(); media.removeEventListener('change', change); document.removeEventListener('visibilitychange', update) }
  }, [])

  useEffect(() => {
    if (effectiveMode !== 'ambient' || paused) return
    // A new timeout is scheduled after each passage; no work while out of view.
    const timer = setTimeout(() => setPassing({ id: Date.now(), reverse: Math.random() > .5 }), 25000 + Math.random() * 6000)
    return () => clearTimeout(timer)
  }, [effectiveMode, paused, passing])

  useEffect(() => {
    if (reduced || paused || mode !== 'arrive' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = root.current
    const surface = el.parentElement
    let frame = 0
    let x = 0, y = 0, tx = 0, ty = 0
    const paint = () => {
      x += (tx - x) * .075; y += (ty - y) * .075
      el.style.setProperty('--pointer-x', x.toFixed(4))
      el.style.setProperty('--pointer-y', y.toFixed(4))
      frame = Math.abs(tx - x) + Math.abs(ty - y) > .001 ? requestAnimationFrame(paint) : 0
    }
    const move = (event) => {
      const box = surface.getBoundingClientRect()
      tx = ((event.clientX - box.left) / box.width - .5) * 2
      ty = ((event.clientY - box.top) / box.height - .5) * 2
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const leave = () => { tx = 0; ty = 0; if (!frame) frame = requestAnimationFrame(paint) }
    surface.addEventListener('pointermove', move)
    surface.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      surface.removeEventListener('pointermove', move); surface.removeEventListener('pointerleave', leave)
      el.style.removeProperty('--pointer-x'); el.style.removeProperty('--pointer-y')
    }
  }, [mode, reduced, paused])

  return (
    <div ref={root} className={`rail-scene is-${effectiveMode} ${paused ? 'is-paused' : ''} ${className}`} aria-hidden="true">
      <div className="scene-sky">
        <span className="scene-glow" />
        <span className="scene-sun" />
        <span className="scene-stars"><i /><i /><i /></span>
        <div className="scene-clouds"><span /><span /><span /></div>
      </div>
      {passing && effectiveMode === 'ambient' && <div key={passing.id} className={`scene-distant ${passing.reverse ? 'is-reverse' : ''}`} onAnimationEnd={() => setPassing(null)}><span>{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</span></div>}
      <div className="scene-layer scene-far"><div className="scene-strip"><Skyline /><Skyline /></div></div>
      <div className="scene-layer scene-near"><div className="scene-strip"><NearLayer /><NearLayer /></div></div>
      <div className="scene-ground">
        <div className="scene-ballast" />
        <div className="scene-track">
          <span className="scene-sleepers" />
          <span className="scene-rail scene-rail-back" />
          <span className="scene-rail scene-rail-front" />
        </div>
      </div>
      <div className="scene-train" onAnimationEnd={(event) => { if (event.animationName === 'train-arrive') setArrived(true) }}>
        <div className="scene-train-parallax"><div className="scene-train-body"><TrainArt coaches={coaches} /></div></div>
        <span className="scene-train-shadow" />
      </div>
      <div className="scene-speed"><i /><i /><i /><i /><i /></div>
      {children}
    </div>
  )
}
