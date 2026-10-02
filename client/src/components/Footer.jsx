import { Icon } from './Icons'
import Logo from './brand/Logo'

const openAssistant = () => window.dispatchEvent(new CustomEvent('ferrovia:assistant'))

export default function Footer({ navigate }) {
  const go = (p) => navigate?.(p)
  return (
    <footer className="footer">
      <div className="footer-rail" aria-hidden="true"><span /><i /><i /><i /><i /></div>
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo variant="horizontal" />
          <p>Search trains across Bangladesh, choose your seat and keep every e-ticket and journey update in one place.</p>
        </div>
        <nav className="footer-col" aria-label="Travel">
          <b>Travel</b>
          <button type="button" onClick={() => go('search')}>Book tickets</button>
          <button type="button" onClick={() => go('track')}>Track a train</button>
          <button type="button" onClick={() => go('tickets')}>My tickets</button>
        </nav>
        <nav className="footer-col" aria-label="Account">
          <b>Account</b>
          <button type="button" onClick={() => go('dashboard')}>Travel dashboard</button>
          <button type="button" onClick={() => go('notifications')}>Notifications</button>
        </nav>
        <nav className="footer-col" aria-label="Help">
          <b>Help</b>
          <button type="button" onClick={() => go('support')}>Help centre</button>
          <button type="button" onClick={openAssistant}>Ask Conduttore</button>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 FERROVIA · Bangladesh railway e-ticketing</span>
        <span className="footer-bottom-meta"><Icon name="lock" size={14} /> Secure sign-in and booking</span>
      </div>
    </footer>
  )
}
