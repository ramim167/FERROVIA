import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icons'
import { Button } from '../components/ui/Button'
import { DelayBadge, Skeleton, StatusBadge } from '../components/ui/Feedback'
import { PageHeader, SectionHeader } from '../components/ui/Layout'
import { StopTimeline } from '../components/ui/Rail'
import { api } from '../lib/api'
import { fmtTime, humanize } from '../lib/format'

/** Horizontal line of every stop; filled up to the last station with a recorded event. */
function ProgressRail({ stops }) {
  const lastIdx = stops.reduce((acc, s, i) => (s.actual_arrival || s.actual_departure ? i : acc), -1)
  const atStation = lastIdx >= 0 && stops[lastIdx].actual_arrival && !stops[lastIdx].actual_departure && stops[lastIdx].scheduled_departure
  const pct = stops.length > 1 ? Math.max(0, lastIdx) / (stops.length - 1) : 0
  const between = lastIdx >= 0 && !atStation && lastIdx < stops.length - 1
  const trainPos = between ? pct + 0.5 / (stops.length - 1) : pct
  return (
    <div className="progress-rail" style={{ '--pct': pct, '--train': lastIdx < 0 ? 0 : trainPos }} aria-hidden="true">
      <div className="progress-rail-track"><span className="progress-rail-fill" /></div>
      {lastIdx >= 0 && <span className={`progress-rail-train ${between ? 'is-moving' : ''}`}><Icon name="train" size={16} /></span>}
      <ol>
        {stops.map((s, i) => (
          <li key={s.trip_stop_id} className={i <= lastIdx ? 'is-passed' : ''} style={{ left: `${stops.length > 1 ? (i / (stops.length - 1)) * 100 : 0}%` }}>
            <span className="progress-rail-node" />
            <span className="progress-rail-code">{s.station_code || s.station_name.slice(0, 3).toUpperCase()}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function TrackTrain({ handleError }) {
  const [query, setQuery] = useState(() => { try { return sessionStorage.getItem('ferrovia-last-train') || 'SUBORNO' } catch { return 'SUBORNO' } })
  const [live, setLive] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const refreshRef = useRef(null)
  const searchRef = useRef(null)
  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (/^\d+$/.test(term)) return []
    return services
      .filter((train) => train.train_status === 'ACTIVE' && (!term || [train.train_name, train.train_code, train.train_type].some((v) => String(v || '').toLowerCase().includes(term))))
      .slice(0, 8)
  }, [query, services])

  useEffect(() => {
    let active = true
    api('/trains').then((data) => active && setServices(data)).catch(handleError)
    return () => { active = false }
  }, [handleError])

  useEffect(() => {
    const close = (event) => { if (searchRef.current && !searchRef.current.contains(event.target)) { setSuggestionsOpen(false); setActiveSuggestion(-1) } }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  useEffect(() => setActiveSuggestion(-1), [query])

  const chooseSuggestion = (train) => { setQuery(train.train_code); setSuggestionsOpen(false); setActiveSuggestion(-1) }
  const handleSuggestionKeys = (event) => {
    if (event.key === 'Escape') { setSuggestionsOpen(false); setActiveSuggestion(-1); return }
    if (!suggestionsOpen || !suggestions.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveSuggestion((i) => (i + 1) % suggestions.length) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1)) }
    else if (event.key === 'Enter' && activeSuggestion >= 0) { event.preventDefault(); chooseSuggestion(suggestions[activeSuggestion]) }
  }

  const track = async (e, refreshTripId) => {
    e?.preventDefault()
    if (!refreshTripId && !query.trim()) return
    setSuggestionsOpen(false)
    setLoading(true)
    try {
      const q = refreshTripId ? String(refreshTripId) : query.trim()
      const data = /^\d+$/.test(q) ? await api(`/trips/${q}/status`) : await api(`/trains/${encodeURIComponent(q)}/status`)
      if (!refreshTripId) { try { sessionStorage.setItem('ferrovia-last-train', q) } catch { /* Optional storage */ } }
      setLive(data)
      setStops(await api(`/trips/${data.trip_id}/stops`))
      setUpdatedAt(new Date())
    } catch (err) {
      setLive(null)
      setStops([])
      handleError(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refreshRef.current = track })
  useEffect(() => {
    if (!autoRefresh || !live) return
    const timer = setInterval(() => { if (!document.hidden && !loading) refreshRef.current?.(null, live.trip_id) }, 60000)
    return () => clearInterval(timer)
  }, [autoRefresh, live, loading])
  const atStop = stops.find((s) => s.actual_arrival && !s.actual_departure)

  return (
    <main className="page page-enter">
      <PageHeader overline="Live journey status" title="Track a train" description="Find a train by name, code or trip ID to follow its station-by-station progress." />

      <form className="track-search card" onSubmit={track} role="search">
        <div className="track-input" ref={searchRef}>
          <span className="input-icon">
            <Icon name="train" size={19} />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSuggestionsOpen(true) }}
              onFocus={(e) => { e.target.select(); setSuggestionsOpen(true) }}
              onKeyDown={handleSuggestionKeys}
              placeholder="Train name, code or trip ID"
              role="combobox"
              aria-label="Train name, code or Trip ID"
              aria-autocomplete="list"
              aria-controls="train-suggestions"
              aria-expanded={suggestionsOpen}
              aria-activedescendant={activeSuggestion >= 0 ? `train-suggestion-${suggestions[activeSuggestion]?.train_id}` : undefined}
            />
          </span>
          {suggestionsOpen && !/^\d+$/.test(query.trim()) && (
            <div className="station-suggestions track-suggestions" id="train-suggestions" role="listbox">
              {suggestions.length ? suggestions.map((train, index) => (
                <button type="button" id={`train-suggestion-${train.train_id}`} className={index === activeSuggestion ? 'active' : ''} role="option" aria-selected={index === activeSuggestion} key={train.train_id}
                  onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActiveSuggestion(index)} onClick={() => chooseSuggestion(train)}>
                  <Icon name="train" size={16} />
                  <span className="grow"><b>{train.train_name}</b><small>{humanize(train.train_type)}</small></span>
                  <span className="station-code">{train.train_code}</span>
                </button>
              )) : <p className="station-no-results">No active train matches “{query}”</p>}
            </div>
          )}
        </div>
        <Button type="submit" size="lg" icon="search" loading={loading} loadingText="Tracking…">Track train</Button>
      </form>

      {loading && !live && (
        <div className="card stack" aria-hidden="true"><Skeleton width="40%" height={22} /><Skeleton height={60} radius={14} /><div className="kv-grid"><Skeleton height={64} radius={12} /><Skeleton height={64} radius={12} /><Skeleton height={64} radius={12} /></div></div>
      )}

      {!loading && !live && (
        <section className="track-intro">
          {[
            ['signal', 'Station updates', 'Arrival and departure times are recorded by the operator at each station.'],
            ['clock', 'Delay at a glance', 'Compare the timetable with what actually happened, stop by stop.'],
            ['route', 'What’s next', 'See the next station and the train’s scheduled time there.'],
          ].map(([icon, title, copy]) => (
            <article key={title} className="track-intro-card">
              <span className="bento-icon"><Icon name={icon} size={20} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </section>
      )}

      {live && (
        <div className={`track-result ${loading ? 'is-refreshing' : ''}`}>
          <div className="row" style={{ marginBottom: 12 }}><button type="button" className="btn btn-secondary btn-sm" aria-pressed={autoRefresh} onClick={() => setAutoRefresh(value => !value)}>{autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}</button><small>Station records refresh every minute while this page is visible.</small></div>
          <section className="live-card">
            <header className="live-card-head">
              <div className="row">
                <span className="journey-badge is-stage"><Icon name="train" size={22} /></span>
                <div>
                  <span className="live-card-sub t-num">Trip #{live.trip_id} · {live.direction === 'UP' ? 'Up service' : live.direction === 'DOWN' ? 'Down service' : live.direction}</span>
                  <h2>{live.train_name}</h2>
                </div>
              </div>
              <div className="row">
                <StatusBadge status={live.trip_status} />
                <DelayBadge minutes={live.current_delay_minutes} />
              </div>
            </header>
            {stops.length > 0 && <ProgressRail stops={stops} />}
            <div className="live-facts">
              <article>
                <small>Current position</small>
                <b>{atStop ? `At ${atStop.station_name}` : live.last_left_station ? `Left ${live.last_left_station}` : live.trip_status === 'COMPLETED' ? 'Journey completed' : 'Not departed yet'}</b>
                <span>{atStop ? `Arrived ${fmtTime(atStop.actual_arrival)}` : live.last_left_at ? `Departed ${fmtTime(live.last_left_at)}` : 'Waiting for the first station update'}</span>
              </article>
              <article>
                <small>Next station</small>
                <b>{atStop ? 'Waiting to depart' : live.next_station || '—'}</b>
                <span>Scheduled {fmtTime(live.next_scheduled_arrival || live.next_scheduled_departure)}</span>
              </article>
              <article>
                <small>Timetable</small>
                <b className="t-num">{fmtTime(live.scheduled_departure)} → {fmtTime(live.scheduled_arrival)}</b>
                <span>The timetable is unchanged when a train runs late</span>
              </article>
              <article>
                <small>Spare trainset</small>
                <b>{Number(live.spare_triggered) ? 'Reserved' : 'Not needed'}</b>
                <span>Reserved automatically after a 60 min delay</span>
              </article>
            </div>
            <footer className="live-card-foot">
              <span>{updatedAt ? `Updated ${updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}</span>
              <Button variant="ghost" size="sm" icon="refresh" onClick={track} loading={loading}>Refresh</Button>
            </footer>
          </section>
          <section className="card">
            <SectionHeader title="Station by station" description="Scheduled times alongside the times recorded at each station." icon="route" />
            <StopTimeline stops={stops} />
          </section>
        </div>
      )}
    </main>
  )
}
