const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function getStoredToken(){
  return localStorage.getItem('rail-token') || ''
}

export function storeSession({token,user}){
  if(token) localStorage.setItem('rail-token', token)
  if(user) localStorage.setItem('rail-user', JSON.stringify(user))
}

export function clearSession(){
  localStorage.removeItem('rail-token')
  localStorage.removeItem('rail-user')
}

export async function api(path, options={}){
  const { token = getStoredToken(), body, headers = {}, ...rest } = options
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? {'Content-Type':'application/json'} : {}),
      ...(token ? {Authorization:`Bearer ${token}`} : {}),
      ...headers,
    },
    ...(body !== undefined ? {body: JSON.stringify(body)} : {}),
  })

  let payload = null
  try { payload = await response.json() } catch { payload = null }
  if(!response.ok){
    const message = payload?.error || `Request failed (${response.status})`
    const debug = import.meta.env.DEV && payload?.debug ? `: ${payload.debug}` : ''
    const error = new Error(`${message}${debug}`)
    error.status = response.status
    error.details = payload?.details
    if (response.status === 401 && !path.startsWith('/auth/')) {
      clearSession()
      window.dispatchEvent(new Event('ferrovia:session-expired'))
    }
    throw error
  }
  return payload?.data ?? payload
}
