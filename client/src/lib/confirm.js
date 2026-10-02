import { createContext, useContext } from 'react'

export const ConfirmContext = createContext(null)

/**
 * Returns `confirm(options) => Promise<boolean>`, an accessible replacement for
 * window.confirm. Options: { title, description, details, confirmLabel,
 * cancelLabel, tone: 'danger' | 'primary' | 'warning', icon }.
 * Falls back to window.confirm if no provider is mounted.
 */
export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  return confirm || ((options = {}) => Promise.resolve(window.confirm(options.title || 'Are you sure?')))
}
