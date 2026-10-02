export const INTRO_KEY = 'ferrovia-intro-seen'

/** Whether the intro should play: once per browser session, never with reduced motion. */
export function shouldPlayIntro() {
  try {
    if (new URLSearchParams(window.location.search).get('intro') === '0') return false
    if (new URLSearchParams(window.location.search).get('intro') === '1') return true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(INTRO_KEY) !== '1'
  } catch {
    return false
  }
}

