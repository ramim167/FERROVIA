import SearchBox from '../components/SearchBox'
import { Icon } from '../components/Icons'
import RailScene from '../components/brand/RailScene'
import { SymbolMark } from '../components/brand/Logo'
import { prefersReducedMotion } from '../lib/motion'
import { fmtSearchDate } from '../lib/format'

/** Split-flap characters: each tile re-mounts (and flips) when its letter changes. */
function Flap({ text, size = 3 }) {
  const chars = (text || '').toUpperCase().padEnd(size, ' ').slice(0, size).split('')
  return (
    <span className="flap" aria-hidden="true">
      {chars.map((c, i) => <span className="flap-tile" key={`${i}-${c}`}>{c.trim() || '·'}</span>)}
    </span>
  )
}

function DepartureBoard({ search, stations }) {
  const find = (name) => stations.find((s) => s.station_name.toLowerCase() === (name || '').trim().toLowerCase())
  const from = find(search.from)
  const to = find(search.to)
  return (
    <aside className="board" aria-label="Your journey selection">
      <div className="board-head">
        <span><span className="board-live" /> Your journey</span>
        <span className="t-num">{fmtSearchDate(search.date)}</span>
      </div>
      <div className="board-route">
        <div className="board-stop">
          <small>From</small>
          <Flap text={from?.station_code} />
          <span className="board-name">{from?.station_name || 'Choose a station'}</span>
        </div>
        <div className="board-rail" aria-hidden="true"><i /><span /><i /></div>
        <div className="board-stop is-end">
          <small>To</small>
          <Flap text={to?.station_code} />
          <span className="board-name">{to?.station_name || 'Choose a station'}</span>
        </div>
      </div>
      <div className="board-foot">
        <span><Icon name="users" size={15} /> {search.passengers} traveller{search.passengers > 1 ? 's' : ''}</span>
        <span><Icon name="seat" size={15} /> Seat of your choice</span>
      </div>
      <p className="sr-only">
        {from ? `From ${from.station_name}` : 'No departure station chosen'}, {to ? `to ${to.station_name}` : 'no arrival station chosen'}.
      </p>
    </aside>
  )
}

const STEPS = [
  ['search', 'Find your train', 'Pick stations and a date. Compare departure times, journey length, classes and fares side by side.'],
  ['seat', 'Choose your seats', 'Select seats on a live coach map. They are held for you while you add passenger details.'],
  ['ticket', 'Travel with your e-ticket', 'Pay securely and your e-ticket lands in My tickets, ready to view, print or download.'],
]

export default function Home({ search, setSearch, doSearch, navigate, stations }) {
  const focusSearch = () => {
    document.getElementById('journey-planner')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
    document.querySelector('#journey-planner input')?.focus({ preventScroll: true })
  }
  const pickStation = (name) => {
    setSearch((current) => {
      if (!current.from || current.from === name) return { ...current, from: name, to: current.to === name ? '' : current.to }
      return { ...current, to: name }
    })
    focusSearch()
  }
  const featured = stations.slice(0, 8)

  return (
    <main className="home">
      <section className="hero" aria-labelledby="hero-title">
        <RailScene mode="arrive" className="hero-scene" coaches={3} />
        <div className="hero-inner">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="hero-kicker"><span className="hero-kicker-dot" /> Bangladesh Railway e-ticketing</span>
              <h1 id="hero-title" className="t-display">Bangladesh by rail, booked in minutes.</h1>
              <p>Search every scheduled train, pick your exact seat on the coach map and carry your e-ticket wherever you go.</p>
              <div className="hero-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('track')}>
                  <Icon name="signal" size={19} /> <span className="btn-label">Track a train</span>
                </button>
                <button type="button" className="hero-link" onClick={() => navigate('tickets')}>
                  My tickets <Icon name="arrow" size={17} />
                </button>
              </div>
            </div>
            <DepartureBoard search={search} stations={stations} />
          </div>
          <div id="journey-planner" className="hero-search">
            <SearchBox search={search} setSearch={setSearch} onSubmit={doSearch} stations={stations} />
          </div>
        </div>
      </section>

      <section className="home-section reveal" aria-labelledby="steps-title">
        <div className="home-head">
          <h2 id="steps-title">From search to seat in three stops</h2>
          <p>The whole booking takes a few minutes, and your seats are held while you finish.</p>
        </div>
        <ol className="steps-line">
          {STEPS.map(([icon, title, copy], i) => (
            <li key={title}>
              <span className="steps-node"><Icon name={icon} size={20} /></span>
              <span className="steps-index t-num">Stop {i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      {featured.length > 0 && (
        <section className="home-section reveal" aria-labelledby="stations-title">
          <div className="home-head is-split">
            <div>
              <h2 id="stations-title">Start from a station</h2>
              <p>Tap a station to fill the planner. The first tap sets your departure, the next sets your arrival.</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={focusSearch}>Open journey planner</button>
          </div>
          <div className="station-grid">
            {featured.map((station) => {
              const role = search.from === station.station_name ? 'From' : search.to === station.station_name ? 'To' : null
              return (
                <button type="button" key={station.station_id} className={`station-tile ${role ? 'is-picked' : ''}`} onClick={() => pickStation(station.station_name)} aria-pressed={Boolean(role)}>
                  <span className="station-tile-code">{station.station_code}</span>
                  <span className="station-tile-name">{station.station_name}</span>
                  <span className="station-tile-city">{role ? `Selected as ${role.toLowerCase()}` : station.city}</span>
                  <Icon name="arrow" size={18} className="station-tile-arrow" />
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="home-section reveal" aria-labelledby="services-title">
        <div className="home-head">
          <h2 id="services-title">Everything after you book</h2>
          <p>Follow your train, manage your tickets and get answers without leaving FERROVIA.</p>
        </div>
        <div className="bento">
          <button type="button" className="bento-card bento-track" onClick={() => navigate('track')}>
            <div className="bento-copy">
              <span className="bento-icon"><Icon name="signal" size={22} /></span>
              <h3>Track any train</h3>
              <p>See the last station a train left, the next stop and its current delay, updated by station staff as it happens.</p>
              <span className="link-btn">Track a train <Icon name="arrow" size={16} /></span>
            </div>
            <div className="bento-visual" aria-hidden="true">
              {['Departed', 'Departed', 'Next stop', 'Scheduled'].map((label, i) => (
                <div key={i} className={`bento-stop ${i < 2 ? 'is-done' : i === 2 ? 'is-next' : ''}`}>
                  <span className="bento-stop-node" />
                  <span className="bento-stop-bar" />
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </button>
          <button type="button" className="bento-card" onClick={() => navigate('tickets')}>
            <span className="bento-icon tone-accent"><Icon name="wallet" size={22} /></span>
            <h3>Ticket wallet</h3>
            <p>Every booking with its PNR, seats and status. Print, download or request a cancellation.</p>
            <span className="link-btn">Open my tickets <Icon name="arrow" size={16} /></span>
          </button>
          <button type="button" className="bento-card" onClick={() => window.dispatchEvent(new CustomEvent('ferrovia:assistant'))}>
            <span className="bento-icon tone-info"><Icon name="bot" size={22} /></span>
            <h3>Ask Conduttore</h3>
            <p>Off days, fares and live status in plain language, answered from FERROVIA’s own records.</p>
            <span className="link-btn">Start a conversation <Icon name="arrow" size={16} /></span>
          </button>
          <button type="button" className="bento-card" onClick={() => navigate('support')}>
            <span className="bento-icon tone-neutral"><Icon name="support" size={22} /></span>
            <h3>Help centre</h3>
            <p>Refund rules, PNR lookups and how seat holds work, with a direct line to support.</p>
            <span className="link-btn">Get help <Icon name="arrow" size={16} /></span>
          </button>
        </div>
      </section>

      <section className="home-cta reveal">
        <svg viewBox="0 0 48 48" className="home-cta-mark" aria-hidden="true"><SymbolMark tone="dark" /></svg>
        <div>
          <h2>Your seat is waiting.</h2>
          <p>Choose a route and date to see every train with available seats.</p>
        </div>
        <button type="button" className="btn btn-inverse btn-lg" onClick={focusSearch}>
          <span className="btn-label">Plan a journey</span><Icon name="arrow" size={19} className="btn-icon-right" />
        </button>
      </section>
    </main>
  )
}
