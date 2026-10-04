import { useCallback, useEffect, useRef, useState } from 'react'
import RailScene from './RailScene'
import Logo from './Logo'

import { INTRO_KEY as KEY } from '../../lib/intro'

/*
 * Cinematic opening, ~3.4s:
 *   0.0s  dusk scene fades up, rails draw across
 *   0.2s  the camera picks up the train at speed, world scrolls past
 *   1.6s  train pulls away to the right, its headlight sweeps the frame
 *   1.7s  the FERROVIA route-symbol draws itself, nodes light in sequence
 *   2.3s  wordmark and line settle
 *   3.0s  the stage lifts away and the site is already there underneath
 * The app renders beneath from the first frame; the intro never delays it.
 */
export default function Intro({ onDone }) {
  const [phase, setPhase] = useState('run')
  const finished = useRef(false)
  const timers = useRef([])

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    timers.current.forEach(clearTimeout)
    try { sessionStorage.setItem(KEY, '1') } catch { /* storage unavailable */ }
    setPhase('exit')
    timers.current = [setTimeout(onDone, 560)]
  }, [onDone])

  useEffect(() => {
    timers.current = [
      setTimeout(() => setPhase('depart'), 1550),
      setTimeout(() => setPhase('brand'), 1700),
      setTimeout(finish, 3050),
    ]
    const onKey = (e) => { if (['Escape', 'Enter', ' '].includes(e.key)) { e.preventDefault(); finish() } }
    window.addEventListener('keydown', onKey)
    return () => { timers.current.forEach(clearTimeout); window.removeEventListener('keydown', onKey) }
  }, [finish])

  return (
    <div className={`intro is-${phase} ${phase === 'brand' || phase === 'exit' ? 'show-brand' : ''}`} role="dialog" aria-label="Welcome to FERROVIA" onClick={finish}>
      <RailScene mode={phase === 'run' ? 'cruise' : 'depart'} className="intro-scene" />
      <div className="intro-brand">
        <Logo variant="symbol" tone="auto" animated className="intro-symbol" />
        <Logo variant="wordmark" tone="auto" className="intro-wordmark" />
        <p className="intro-tagline">Move smarter. Travel connected.</p>
      </div>
      <div className="intro-progress" aria-hidden="true"><span /></div>
      <button type="button" className="intro-skip" onClick={(e) => { e.stopPropagation(); finish() }}>
        Skip intro
      </button>
    </div>
  )
}
