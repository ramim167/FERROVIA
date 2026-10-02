import { flushSync } from 'react-dom'

let activeTransition

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Keep navigation immediate; browsers with View Transitions animate the snapshots.
export function animateUpdate(update) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }
  activeTransition?.skipTransition()
  activeTransition = document.startViewTransition(() => flushSync(update))
  activeTransition.ready.catch(() => {})
}
