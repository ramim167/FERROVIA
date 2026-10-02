import { useCallback, useId, useState } from 'react'
import useDialog from '../../lib/useDialog'
import { ConfirmContext } from '../../lib/confirm'
import { Icon } from '../Icons'
import { Button } from './Button'

/**
 * Modal dialog: focus is trapped, Escape and backdrop click close it, and focus
 * returns to the trigger on close (see useDialog).
 */
export function Modal({ title, description, onClose, children, footer, size = 'md', className = '', hideTitle = false, icon, tone }) {
  const dialogRef = useDialog(onClose)
  const titleId = useId()
  const descId = useId()
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={`dialog dialog-${size} ${tone ? `dialog-tone-${tone}` : ''} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
      >
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" size={18} />
        </button>
        {(title || icon) && (
          <header className={`dialog-header ${hideTitle ? 'sr-only' : ''}`}>
            {icon && <span className="dialog-icon"><Icon name={icon} size={22} /></span>}
            <div>
              <h2 id={titleId}>{title}</h2>
              {description && <p id={descId}>{description}</p>}
            </div>
          </header>
        )}
        <div className="dialog-body">{children}</div>
        {footer && <footer className="dialog-footer">{footer}</footer>}
      </div>
    </div>
  )
}

/** Side drawer. Used for focused detail views and the mobile workspace navigation. */
export function Drawer({ title, onClose, children, side = 'right', footer, className = '' }) {
  const dialogRef = useDialog(onClose)
  const titleId = useId()
  return (
    <div className="overlay overlay-drawer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside ref={dialogRef} className={`drawer drawer-${side} ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="drawer-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="dialog-close is-static" onClick={onClose} aria-label="Close panel">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-footer">{footer}</footer>}
      </aside>
    </div>
  )
}

const TONE_ICON = { danger: 'alert', warning: 'alert', primary: 'info', success: 'checkCircle' }

function ConfirmDialog({ options, onResolve }) {
  const tone = options.tone || 'primary'
  return (
    <Modal
      title={options.title}
      description={options.description}
      onClose={() => onResolve(false)}
      size="sm"
      tone={tone}
      icon={options.icon || TONE_ICON[tone]}
      footer={
        <>
          <Button variant="secondary" onClick={() => onResolve(false)} data-autofocus>
            {options.cancelLabel || 'Keep as is'}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => onResolve(true)}>
            {options.confirmLabel || 'Confirm'}
          </Button>
        </>
      }
    >
      {options.details}
    </Modal>
  )
}

export function ConfirmProvider({ children }) {
  const [pending, setPending] = useState(null)
  const confirm = useCallback(
    (options = {}) => new Promise((resolve) => setPending({ options, resolve })),
    []
  )
  const resolve = (value) => {
    pending?.resolve(value)
    setPending(null)
  }
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && <ConfirmDialog options={pending.options} onResolve={resolve} />}
    </ConfirmContext.Provider>
  )
}
