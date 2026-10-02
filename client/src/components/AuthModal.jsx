import { useState } from 'react'
import useDialog from '../lib/useDialog'
import { api } from '../lib/api'
import { Icon } from './Icons'
import Logo from './brand/Logo'
import TrainArt from './brand/TrainArt'
import { Button } from './ui/Button'

export default function AuthModal({ mode, setMode, close, onSuccess }) {
  const dialogRef = useDialog(close)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountRole, setAccountRole] = useState('PASSENGER')
  const [showPassword, setShowPassword] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const f = new FormData(e.currentTarget)
    try {
      const data =
        mode === 'signin'
          ? await api('/auth/login', { method: 'POST', token: '', body: { email: f.get('email'), password: f.get('password') } })
          : await api('/auth/register', { method: 'POST', token: '', body: { fullName: f.get('name'), email: f.get('email'), phone: f.get('phone'), password: f.get('password'), role: accountRole } })
      await onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="dialog dialog-xl auth" ref={dialogRef} role="dialog" aria-modal="true" aria-label={mode === 'signin' ? 'Sign in to FERROVIA' : 'Create a FERROVIA account'} tabIndex={-1}>
        <button type="button" className="dialog-close" onClick={close} aria-label="Close dialog"><Icon name="close" size={18} /></button>
        <aside className="auth-visual" aria-hidden="true">
          <Logo variant="horizontal" tone="auto" />
          <div className="auth-visual-copy">
            <h2>{mode === 'signin' ? 'Welcome back aboard.' : 'Your journeys, all in one place.'}</h2>
            <p>Passengers book and manage tickets. Operators record station events. Admins run the network.</p>
          </div>
          <div className="auth-network">
            <svg viewBox="0 0 300 120">
              <path d="M10 90H110C140 90 150 40 180 40H290" className="auth-line" />
              <path d="M10 104H120C150 104 160 66 190 66H290" className="auth-line is-2" />
              {[[10, 90], [110, 90], [180, 40], [290, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className={`auth-node ${i === 3 ? 'is-end' : ''}`} />)}
            </svg>
          </div>
          <div className="auth-train"><TrainArt coaches={1} /></div>
        </aside>
        <form onSubmit={submit} className="auth-form">
          <div className="auth-switch" role="tablist" aria-label="Account">
            <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'is-active' : ''} onClick={() => { setMode('signin'); setError('') }}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setError('') }}>Create account</button>
          </div>
          <div className="auth-heading">
            <h2>{mode === 'signin' ? 'Sign in to FERROVIA' : 'Create your account'}</h2>
            <p>{mode === 'signin' ? 'Use the email and password you registered with.' : 'It takes less than a minute.'}</p>
          </div>
          {mode === 'register' && (
            <>
              <label>Full name<input name="name" required placeholder="Your full name" autoComplete="name" /></label>
              <div className="form-row">
                <label>Phone <span className="opt">(optional)</span><input name="phone" placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" /></label>
                <label>Account type
                  <select value={accountRole} onChange={(event) => setAccountRole(event.target.value)}>
                    <option value="PASSENGER">Passenger</option>
                    <option value="OPERATOR">Operator</option>
                  </select>
                </label>
              </div>
              <p className={`notice ${accountRole === 'OPERATOR' ? 'notice-warning' : 'notice-brand'}`}>
                <Icon name={accountRole === 'OPERATOR' ? 'shield' : 'ticket'} size={16} />
                {accountRole === 'OPERATOR' ? 'Operator accounts require admin approval before sign-in.' : 'Create a user account to book and manage journeys.'}
              </p>
            </>
          )}
          <label>Email<input name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></label>
          <label>Password
            <span className="password-field">
              <input name="password" type={showPassword ? 'text' : 'password'} required minLength="8" placeholder="At least 8 characters" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                <Icon name="eye" size={18} />
              </button>
            </span>
          </label>
          {error && <div className="form-error" role="alert"><Icon name="alertCircle" size={16} />{error}</div>}
          <Button type="submit" block size="lg" className="full" loading={loading} loadingText="Please wait…">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
          <p className="auth-foot">
            {mode === 'signin' ? 'New to FERROVIA?' : 'Already have an account?'}{' '}
            <button type="button" className="link-btn" onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setError('') }}>
              {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
