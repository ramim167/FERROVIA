import { Icon } from './Icons'

/** Live region for success and error feedback. Errors are announced assertively. */
export default function Toasts({ toast, error, onDismissToast, onDismissError }) {
  return (
    <div className="toast-region">
      <div aria-live="polite" aria-atomic="true">
        {toast && (
          <div className="toast" key={toast}>
            <Icon name="checkCircle" size={19} />
            <p>{toast}</p>
            <button type="button" onClick={onDismissToast} aria-label="Dismiss"><Icon name="close" size={16} /></button>
          </div>
        )}
      </div>
      <div aria-live="assertive" aria-atomic="true">
        {error && (
          <div className="toast is-error" key={error}>
            <Icon name="alert" size={19} />
            <p>{error}</p>
            <button type="button" onClick={onDismissError} aria-label="Dismiss"><Icon name="close" size={16} /></button>
          </div>
        )}
      </div>
    </div>
  )
}
