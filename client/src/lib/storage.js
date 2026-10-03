// Browser storage is optional. Private browsing and malformed old values must
// never prevent the application from rendering.
export function readStored(key, fallback, session = false) {
  try {
    const value = JSON.parse((session ? sessionStorage : localStorage).getItem(key))
    return value == null ? fallback : value
  } catch { return fallback }
}
export function writeStored(key, value, session = false) {
  try { (session ? sessionStorage : localStorage).setItem(key, JSON.stringify(value)) } catch { /* Optional persistence */ }
}
