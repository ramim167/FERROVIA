import { useEffect, useMemo, useRef, useState } from 'react'
import SearchBox from '../components/SearchBox'
import Ticket, { CopyChip } from '../components/Ticket'
import { Icon } from '../components/Icons'
import { Button } from '../components/ui/Button'
import { Badge, DelayBadge, EmptyState, ErrorState, SkeletonJourney } from '../components/ui/Feedback'
import { Drawer } from '../components/ui/Overlay'
import { BookingStepper, RouteLine } from '../components/ui/Rail'
import { delayText, durationText, fmtDate, fmtSearchDate, fmtTime, humanize, money } from '../lib/format'

const TIME_BANDS = [
  ['Morning', '05:00 – 11:59', 'sun'],
  ['Afternoon', '12:00 – 16:59', 'sun'],
  ['Evening', '17:00 – 21:59', 'moon'],
  ['Night', '22:00 – 04:59', 'moon'],
]
const TRAIN_TYPES = ['INTERCITY', 'EXPRESS', 'MAIL']

const codeOf = (stations, name) => stations.find((s) => s.station_name === name)?.station_code

/* ---------------------------------------------------------------- results */

function Filters({ times, types, toggle, setTimes, setTypes, onDone }) {
  return (
    <div className="filters">
      <div className="filters-group">
        <span className="filters-label">Departure time</span>
        <div className="filters-options">
          {TIME_BANDS.map(([x, range]) => (
            <label className="check-pill filter-pill" key={x}>
              <input type="checkbox" checked={times.includes(x)} onChange={() => toggle(setTimes, x)} />
              <span className="check-box"><Icon name="check" size={12} strokeWidth={3} /></span>
              <span className="grow">{x}<small>{range}</small></span>
            </label>
          ))}
        </div>
      </div>
      <div className="filters-group">
        <span className="filters-label">Train type</span>
        <div className="filters-options">
          {TRAIN_TYPES.map((x) => (
            <label className="check-pill filter-pill" key={x}>
              <input type="checkbox" checked={types.includes(x)} onChange={() => toggle(setTypes, x)} />
              <span className="check-box"><Icon name="check" size={12} strokeWidth={3} /></span>
              <span className="grow">{humanize(x)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="filters-actions">
        <Button variant="ghost" size="sm" onClick={() => { setTimes([]); setTypes([]) }} disabled={!times.length && !types.length}>
          Clear filters
        </Button>
        {onDone && <Button size="sm" onClick={onDone}>Show trains</Button>}
      </div>
    </div>
  )
}

function JourneyCard({ t, index, stations, favorite, onFavorite, onDetails, onChoose }) {
  const minFare = Math.min(...(t.classes || []).map((c) => Number(c.farePerPassenger || Infinity)))
  return (
    <article className="journey-card card" style={{ '--i': Math.min(index, 6) }}>
      <header className="journey-head">
        <div className="journey-id">
          <span className="journey-badge"><Icon name="train" size={20} /></span>
          <div>
            <h3>{t.train_name}</h3>
            <div className="journey-meta">
              <span className="t-code">{t.train_code}</span>
              <span>{humanize(t.train_type)}</span>
              <span>{t.direction === 'UP' ? 'Up service' : t.direction === 'DOWN' ? 'Down service' : t.direction}</span>
            </div>
          </div>
        </div>
        <div className="journey-tools">
          <DelayBadge minutes={t.current_delay_minutes} />
          <button
            type="button"
            className={`icon-btn icon-btn-sm fav-btn ${favorite ? 'is-on' : ''}`}
            onClick={onFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? `Remove ${t.train_name} from saved trains` : `Save ${t.train_name}`}
            title={favorite ? 'Saved' : 'Save train'}
          >
            <Icon name="heart" size={17} />
          </button>
        </div>
      </header>

      <RouteLine
        from={t.source_station}
        to={t.destination_station}
        fromCode={codeOf(stations, t.source_station)}
        toCode={codeOf(stations, t.destination_station)}
        departure={t.scheduled_departure}
        arrival={t.scheduled_arrival}
        duration={durationText(t.scheduled_departure, t.scheduled_arrival)}
        note={humanize(t.trip_status)}
        animate
      />

      {t.last_left_station && (
        <p className="journey-live">
          <span className="badge-dot is-pulsing" style={{ '--badge-dot': 'var(--color-accent)' }} />
          Left {t.last_left_station} at {fmtTime(t.last_left_at)} · {delayText(t.current_delay_minutes)}
        </p>
      )}

      <div className="journey-classes" role="group" aria-label={`Classes on ${t.train_name}`}>
        {(t.classes || []).length ? (
          t.classes.map((c) => {
            const soldOut = !c.availableSeats
            const low = c.availableSeats > 0 && c.availableSeats <= 5
            return (
              <button key={c.classId} type="button" className="fare-tile" disabled={soldOut} onClick={() => onChoose(t, c)}>
                <span className="fare-tile-top">
                  <b>{humanize(c.className)}</b>
                  {Number(c.farePerPassenger) === minFare && t.classes.length > 1 && <Badge tone="brand">Lowest fare</Badge>}
                </span>
                <strong className="fare-tile-price t-num">{money(c.farePerPassenger)}</strong>
                <span className={`fare-tile-seats ${soldOut ? 'is-out' : low ? 'is-low' : ''}`}>
                  {soldOut ? 'Sold out' : `${c.availableSeats} seat${c.availableSeats === 1 ? '' : 's'} left`}
                </span>
                {!soldOut && <span className="fare-tile-cta">Select <Icon name="arrow" size={15} /></span>}
              </button>
            )
          })
        ) : (
          <p className="journey-noclass"><Icon name="info" size={16} /> Fares and seats are not configured for this trip yet.</p>
        )}
      </div>

      <footer className="journey-foot">
        <button type="button" className="link-btn" onClick={() => onDetails(t)}>
          <Icon name="route" size={16} /> Stops and journey details
        </button>
        <span className="journey-from t-num">From {Number.isFinite(minFare) ? money(minFare) : '—'}</span>
      </footer>
    </article>
  )
}

export function SearchPage({ search, setSearch, doSearch, chooseTrain, favorites, toggleFavorite, setDetailTrain, loading, trains, stations, searchError }) {
  const [saved] = useState(() => { try { return JSON.parse(sessionStorage.getItem('ferrovia-filters')) || {} } catch { return {} } })
  const [times, setTimes] = useState(saved.times || [])
  const [types, setTypes] = useState(saved.types || [])
  const [sort, setSort] = useState(saved.sort || 'earliest')
  useEffect(() => { try { sessionStorage.setItem('ferrovia-filters', JSON.stringify({ times, types, sort })) } catch { /* Optional storage */ } }, [times, types, sort])
  const [editing, setEditing] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtered = useMemo(() => {
    let list = [...trains]
    if (times.length)
      list = list.filter((t) => {
        const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', hourCycle: 'h23' }).format(new Date(t.scheduled_departure)))
        return times.some((x) =>
          x === 'Morning' ? h >= 5 && h < 12 : x === 'Afternoon' ? h >= 12 && h < 17 : x === 'Evening' ? h >= 17 && h < 22 : h >= 22 || h < 5
        )
      })
    if (types.length) list = list.filter((t) => types.includes(String(t.train_type || '').toUpperCase()))
    return list.sort((a, b) =>
      sort === 'lowest'
        ? Math.min(...(a.classes || []).map((c) => Number(c.farePerPassenger || 999999))) - Math.min(...(b.classes || []).map((c) => Number(c.farePerPassenger || 999999)))
        : sort === 'arrival' ? new Date(a.scheduled_arrival) - new Date(b.scheduled_arrival)
        : sort === 'duration' ? (new Date(a.scheduled_arrival) - new Date(a.scheduled_departure)) - (new Date(b.scheduled_arrival) - new Date(b.scheduled_departure))
        : new Date(a.scheduled_departure) - new Date(b.scheduled_departure)
    )
  }, [trains, times, types, sort])
  const toggle = (setter, value) => setter((a) => (a.includes(value) ? a.filter((x) => x !== value) : [...a, value]))
  const activeFilters = times.length + types.length
  const fromCode = codeOf(stations, search.from)
  const toCode = codeOf(stations, search.to)

  return (
    <main className="page page-enter">
      <BookingStepper step={0} />
      <section className="results-hero">
        <div className="results-route">
          <span className="results-code">{fromCode || search.from?.slice(0, 3).toUpperCase() || '—'}</span>
          <span className="results-rail" aria-hidden="true"><i /><Icon name="train" size={18} /><i /></span>
          <span className="results-code">{toCode || search.to?.slice(0, 3).toUpperCase() || '—'}</span>
        </div>
        <div className="results-summary">
          <h1>{search.from || 'Anywhere'} to {search.to || 'anywhere'}</h1>
          <p>
            <span><Icon name="calendar" size={15} /> {fmtSearchDate(search.date)}</span>
            <span><Icon name="users" size={15} /> {search.passengers} passenger{search.passengers > 1 ? 's' : ''}</span>
          </p>
        </div>
        <Button variant={editing ? 'secondary' : 'tertiary'} icon={editing ? 'close' : 'search'} onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
          {editing ? 'Close' : 'Change search'}
        </Button>
      </section>
      {editing && (
        <div className="results-edit">
          <SearchBox compact search={search} setSearch={setSearch} onSubmit={() => { setEditing(false); doSearch() }} stations={stations} />
        </div>
      )}

      <div className="results-layout">
        <aside className="results-filters card" aria-label="Filters">
          <div className="results-filters-head">
            <h2><Icon name="sliders" size={18} /> Filters</h2>
            {activeFilters > 0 && <Badge tone="brand">{activeFilters} active</Badge>}
          </div>
          <Filters times={times} types={types} toggle={toggle} setTimes={setTimes} setTypes={setTypes} />
        </aside>

        <section className="results-list" aria-live="polite" aria-busy={loading}>
          <div className="results-toolbar">
            <p className="results-count">
              {loading ? 'Searching trains…' : <><b className="t-num">{filtered.length}</b> {filtered.length === 1 ? 'train' : 'trains'} available</>}
            </p>
            <div className="row">
              <button type="button" className="btn btn-secondary btn-sm results-filter-btn" onClick={() => setFiltersOpen(true)}>
                <Icon name="sliders" size={16} /> Filters{activeFilters ? ` (${activeFilters})` : ''}
              </button>
              <div className="segmented results-sort" role="radiogroup" aria-label="Sort trains">
                <label><input type="radio" name="sort" checked={sort === 'earliest'} onChange={() => setSort('earliest')} /> <Icon name="clock" size={15} /> Earliest</label>
                <label><input type="radio" name="sort" checked={sort === 'lowest'} onChange={() => setSort('lowest')} /> <Icon name="wallet" size={15} /> Lowest fare</label>
                <label><input type="radio" name="sort" checked={sort === 'arrival'} onChange={() => setSort('arrival')} /> Earliest arrival</label>
                <label><input type="radio" name="sort" checked={sort === 'duration'} onChange={() => setSort('duration')} /> Shortest journey</label>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="stack"><SkeletonJourney /><SkeletonJourney /></div>
          ) : searchError ? (
            <ErrorState title="We couldn't load trains for this route" description={searchError} onRetry={doSearch} />
          ) : !filtered.length ? (
            <div className="card">
              <EmptyState
                icon="search"
                title={trains.length ? 'No trains match these filters' : 'No scheduled trains on this date'}
                description={trains.length ? 'Clear a filter to see the other trains on this route.' : 'Try another date or a nearby station. Trips appear here once they are issued for the date.'}
                action={trains.length ? <Button variant="secondary" onClick={() => { setTimes([]); setTypes([]) }}>Clear filters</Button> : <Button icon="search" onClick={() => setEditing(true)}>Change search</Button>}
              />
            </div>
          ) : (
            <div className="stack">
              {filtered.map((t, i) => (
                <JourneyCard
                  key={t.trip_id}
                  t={t}
                  index={i}
                  stations={stations}
                  favorite={favorites.includes(t.train_id)}
                  onFavorite={() => toggleFavorite(t.train_id)}
                  onDetails={setDetailTrain}
                  onChoose={chooseTrain}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {filtersOpen && (
        <Drawer title="Filter trains" onClose={() => setFiltersOpen(false)}>
          <Filters times={times} types={types} toggle={toggle} setTimes={setTimes} setTypes={setTypes} onDone={() => setFiltersOpen(false)} />
        </Drawer>
      )}
    </main>
  )
}

/* ---------------------------------------------------------------- summary */

export function Summary({ train, cls, search, seatLabels, total, children, title = 'Your journey' }) {
  return (
    <aside className="summary card" aria-label="Booking summary">
      <div className="summary-head">
        <span className="journey-badge"><Icon name="train" size={20} /></span>
        <div>
          <small>{title}</small>
          <b>{train?.train_name || '—'}</b>
        </div>
        {cls?.className && <Badge tone="brand">{humanize(cls.className)}</Badge>}
      </div>
      <RouteLine size="sm" from={search.from} to={search.to} departure={train?.scheduled_departure} arrival={train?.scheduled_arrival} />
      <dl className="summary-list">
        <div><dt>Date</dt><dd>{fmtSearchDate(search.date)}</dd></div>
        <div><dt>Passengers</dt><dd>{search.passengers}</dd></div>
        <div>
          <dt>Seats</dt>
          <dd>{seatLabels?.length ? <span className="seat-chips">{seatLabels.map((s) => <span key={s} className="seat-chip">{s}</span>)}</span> : <span className="muted">Not selected</span>}</dd>
        </div>
        {cls?.farePerPassenger != null && <div><dt>Fare per seat</dt><dd>{money(cls.farePerPassenger)}</dd></div>}
      </dl>
      <div className="summary-total">
        <span>Total</span>
        <strong className="t-num">{money(total)}</strong>
      </div>
      {children}
    </aside>
  )
}

/* ---------------------------------------------------------------- seats */

export function SeatPage({ train, cls, search, seatList, seats, seatLabels, toggleSeat, next, back, total }) {
  const grouped = useMemo(
    () =>
      Object.entries(
        seatList.reduce((m, s) => {
          ;(m[s.coach_code] ??= []).push(s)
          return m
        }, {})
      ).map(([coach, list]) => [
        coach,
        [...list].sort((a, b) => String(a.seat_number).localeCompare(String(b.seat_number), undefined, { numeric: true, sensitivity: 'base' })),
      ]),
    [seatList]
  )
  const [coach, setCoach] = useState(grouped[0]?.[0])
  const activeCoach = grouped.find(([c]) => c === coach) || grouped[0]
  const remaining = search.passengers - seats.length

  return (
    <main className="page page-enter has-sticky-bar">
      <BookingStepper step={1} />
      <header className="page-header">
        <div className="page-header-copy">
          <span className="page-overline">{humanize(cls?.className)} · {search.from} to {search.to}</span>
          <h1>Choose {search.passengers === 1 ? 'your seat' : `${search.passengers} seats`}</h1>
          <p>Seats you select are reserved for you once you continue to passenger details.</p>
        </div>
      </header>

      <div className="booking-layout">
        <section className="seat-panel card" aria-label="Seat map">
          {!grouped.length ? (
            <EmptyState icon="seat" title="No seats are configured for this class" description="Go back and pick another class or train." action={<Button variant="secondary" icon="arrowLeft" onClick={back}>Back to trains</Button>} />
          ) : (
            <>
              <div className="coach-picker" role="tablist" aria-label="Coaches" onKeyDown={(e) => {
                const buttons = [...e.currentTarget.querySelectorAll('[role="tab"]')]
                const index = buttons.indexOf(document.activeElement)
                const next = e.key === 'ArrowRight' ? (index + 1) % buttons.length : e.key === 'ArrowLeft' ? (index - 1 + buttons.length) % buttons.length : e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : null
                if (next != null) { e.preventDefault(); buttons[next].click(); buttons[next].focus() }
              }}>
                {grouped.map(([code, list]) => {
                  const free = list.filter((s) => Number(s.is_available) === 1).length
                  const picked = list.filter((s) => seats.includes(Number(s.trip_seat_id))).length
                  return (
                    <button key={code} type="button" role="tab" id={`coach-tab-${code}`} aria-controls="coach-panel" tabIndex={activeCoach[0] === code ? 0 : -1} aria-selected={activeCoach[0] === code} className="coach-tab" onClick={() => setCoach(code)}>
                      <span className="coach-tab-code">{code}</span>
                      <span className="coach-tab-meta">{free} free</span>
                      {picked > 0 && <span className="coach-tab-picked">{picked}</span>}
                    </button>
                  )
                })}
              </div>

              <div className="seat-legend" aria-label="Legend">
                <span><i className="lg-available" /> Available</span>
                <span><i className="lg-selected" /> Your selection</span>
                <span><i className="lg-booked" /> Booked or held</span>
                <span><i className="lg-window" /> Window</span>
              </div>

              <div className="coach" id="coach-panel" role="tabpanel" aria-labelledby={`coach-tab-${activeCoach[0]}`} key={activeCoach[0]}>
                <div className="coach-end"><Icon name="arrow" size={15} /> Direction of travel</div>
                <div className="coach-body">
                  <div className="seat-grid" role="group" aria-label={`Coach ${activeCoach[0]} seats`} onKeyDown={(e) => {
                    const grid = [...e.currentTarget.querySelectorAll('.seat')]
                    const i = grid.indexOf(document.activeElement)
                    const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4 }[e.key]
                    if (!delta || i < 0) return
                    e.preventDefault()
                    let target = i + delta
                    while (target >= 0 && target < grid.length && grid[target].disabled) target += delta
                    if (grid[target]) { grid.forEach(el => { el.tabIndex = -1 }); grid[target].tabIndex = 0; grid[target].focus() }
                  }}>
                    {activeCoach[1].map((s, i) => {
                      const id = Number(s.trip_seat_id)
                      const blocked = Number(s.is_available) !== 1
                      const selected = seats.includes(id)
                      const window = String(s.seat_type || '').toUpperCase() === 'WINDOW'
                      return (
                        <button
                          key={id}
                          type="button"
                          className={`seat ${blocked ? 'is-booked' : ''} ${selected ? 'is-selected' : ''} ${window ? 'is-window' : ''} ${[1, 2, 4, 5][i % 4] < 3 ? 'is-left' : 'is-right'}`}
                          style={{ gridColumn: [1, 2, 4, 5][i % 4] }}
                          disabled={blocked}
                          tabIndex={id === Number(activeCoach[1].find(seat => Number(seat.is_available) === 1)?.trip_seat_id) ? 0 : -1}
                          aria-pressed={selected}
                          aria-label={`Seat ${activeCoach[0]}-${s.seat_number}${window ? ', window' : ''}${blocked ? ', unavailable' : selected ? ', selected' : ''}`}
                          onClick={() => toggleSeat(id)}
                        >
                          <span className="seat-back" aria-hidden="true" />
                          <span className="seat-num t-num">{s.seat_number}</span>
                          {blocked && <Icon name="close" size={12} className="seat-x" />}
                        </button>
                      )
                    })}
                    <span className="seat-aisle" aria-hidden="true">Aisle</span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="panel-actions">
            <Button variant="secondary" icon="arrowLeft" onClick={back}>Back to trains</Button>
            <Button iconRight="arrow" onClick={next} disabled={!grouped.length}>Continue to passengers</Button>
          </div>
        </section>
        <Summary train={train} cls={cls} search={search} seatLabels={seatLabels} total={total}>
          <p className={`summary-progress ${remaining === 0 ? 'is-done' : ''}`}>
            <Icon name={remaining === 0 ? 'checkCircle' : 'seat'} size={16} />
            {remaining === 0 ? 'All seats selected' : `${remaining} more seat${remaining > 1 ? 's' : ''} to choose`}
          </p>
        </Summary>
      </div>

      <div className="sticky-bar" role="region" aria-label="Selection">
        <div><small>{seats.length} of {search.passengers} seats</small><b className="t-num">{money(total)}</b></div>
        <Button iconRight="arrow" onClick={next} disabled={!grouped.length}>Continue</Button>
      </div>
    </main>
  )
}

/* ---------------------------------------------------------------- passengers */

const nameError = (p) => (!p.name?.trim() ? 'Enter the passenger’s full name.' : '')
const ageError = (p) => (!p.age ? 'Enter an age.' : Number(p.age) < 1 || Number(p.age) > 120 ? 'Age must be between 1 and 120.' : '')

export function PassengerPage({ passengers, update, next, back, train, cls, search, seatLabels, total, user }) {
  const [showErrors, setShowErrors] = useState(false)
  const formRef = useRef(null)
  const complete = passengers.filter((p) => !nameError(p) && !ageError(p)).length
  const submit = (e) => {
    e.preventDefault()
    if (complete < passengers.length) {
      setShowErrors(true)
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    next()
  }
  return (
    <main className="page page-enter has-sticky-bar">
      <BookingStepper step={2} />
      <header className="page-header">
        <div className="page-header-copy">
          <span className="page-overline">Passenger details</span>
          <h1>Who is travelling?</h1>
          <p>Enter each traveller’s name as it appears on their photo ID. All fields are required.</p>
        </div>
      </header>
      <div className="booking-layout">
        <form className="passenger-panel" onSubmit={submit} noValidate ref={formRef}>
          <div className="passenger-progress" aria-live="polite">
            <span className="passenger-progress-bar"><span style={{ width: `${(complete / Math.max(passengers.length, 1)) * 100}%` }} /></span>
            <span className="t-num">{complete} of {passengers.length} complete</span>
          </div>
          {passengers.map((p, i) => {
            const nErr = showErrors && nameError(p)
            const aErr = showErrors && ageError(p)
            const done = !nameError(p) && !ageError(p)
            return (
              <fieldset className={`passenger-card card ${done ? 'is-done' : ''}`} key={i}>
                <legend className="sr-only">Passenger {i + 1}, seat {seatLabels[i]}</legend>
                <div className="passenger-card-head">
                  <span className="passenger-index">{done ? <Icon name="check" size={16} strokeWidth={2.6} /> : i + 1}</span>
                  <div className="grow">
                    <b>Passenger {i + 1}</b>
                    <small>Seat <span className="seat-chip">{seatLabels[i]}</span></small>
                  </div>
                  {i === 0 && user?.full_name && p.name !== user.full_name && (
                    <button type="button" className="link-btn" onClick={() => update(0, 'name', user.full_name)}>
                      <Icon name="user" size={15} /> Use my name
                    </button>
                  )}
                </div>
                <div className="passenger-fields">
                  <div className="field passenger-name">
                    <label className="field-label" htmlFor={`p${i}-name`}>Full name</label>
                    <input id={`p${i}-name`} value={p.name} autoComplete={i === 0 ? 'name' : 'off'} onChange={(e) => update(i, 'name', e.target.value)} placeholder="e.g. Nusrat Jahan" aria-invalid={Boolean(nErr)} aria-describedby={nErr ? `p${i}-name-err` : undefined} />
                    {nErr && <span className="field-error" id={`p${i}-name-err`}><Icon name="alertCircle" size={14} />{nErr}</span>}
                  </div>
                  <div className="field passenger-age">
                    <label className="field-label" htmlFor={`p${i}-age`}>Age</label>
                    <input id={`p${i}-age`} type="number" inputMode="numeric" min="1" max="120" value={p.age} onChange={(e) => update(i, 'age', e.target.value)} placeholder="Years" aria-invalid={Boolean(aErr)} aria-describedby={aErr ? `p${i}-age-err` : undefined} />
                    {aErr && <span className="field-error" id={`p${i}-age-err`}><Icon name="alertCircle" size={14} />{aErr}</span>}
                  </div>
                  <div className="field passenger-gender">
                    <span className="field-label" id={`p${i}-gender`}>Gender</span>
                    <div className="segmented" role="radiogroup" aria-labelledby={`p${i}-gender`}>
                      {[['MALE', 'Male'], ['FEMALE', 'Female'], ['OTHER', 'Other']].map(([value, label]) => (
                        <label key={value}><input type="radio" name={`gender-${i}`} value={value} checked={p.gender === value} onChange={() => update(i, 'gender', value)} />{label}</label>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>
            )
          })}
          <div className="panel-actions">
            <Button variant="secondary" icon="arrowLeft" onClick={back}>Back to seats</Button>
            <Button type="submit" iconRight="arrow">Hold seats and continue</Button>
          </div>
        </form>
        <Summary train={train} cls={cls} search={search} seatLabels={seatLabels} total={total} />
      </div>
      <div className="sticky-bar">
        <div><small>{complete} of {passengers.length} complete</small><b className="t-num">{money(total)}</b></div>
        <Button iconRight="arrow" onClick={submit}>Continue</Button>
      </div>
    </main>
  )
}

/* ---------------------------------------------------------------- payment */

function useCountdown(target) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!target) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  if (!target) return null
  return Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000))
}

function restrictDigits(event, maxLength) {
  const input = event.currentTarget
  input.value = input.value.replace(/\D/g, '').slice(0, maxLength)
}

function formatFutureCardExpiry(event) {
  const input = event.currentTarget
  const digits = input.value.replace(/\D/g, '').slice(0, 4)
  input.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  const match = input.value.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
  if (!match) { input.setCustomValidity(''); return }
  const expiryYear = 2000 + Number(match[2])
  const expiryMonth = Number(match[1])
  const now = new Date()
  const isFuture = expiryYear > now.getFullYear() || (expiryYear === now.getFullYear() && expiryMonth > now.getMonth() + 1)
  input.setCustomValidity(isFuture ? '' : 'Expiry must be after the current month.')
}

const METHODS = [
  ['Mobile Banking', 'phone', 'bKash, Nagad, Rocket'],
  ['Card', 'card', 'Visa, Mastercard, Amex'],
  ['Bank Transfer', 'bank', 'Online banking reference'],
]

export function PaymentPage({ booking, confirm, back, train, cls, search, seatLabels, paying, navigate }) {
  const [method, setMethod] = useState('Mobile Banking')
  const expiry = booking?.passengers?.find((p) => p.hold_expires_at)?.hold_expires_at
  const left = useCountdown(expiry)
  const total = Number(booking?.total_fare || 0)
  if (!booking)
    return (
      <main className="page page-enter">
        <div className="card">
          <EmptyState icon="seat" title="No seats are on hold" description="Your seat hold has ended or was never created. Pick a train and seats to start a new booking." action={<Button icon="search" onClick={() => navigate('search')}>Find trains</Button>} />
        </div>
      </main>
    )
  const mm = left != null ? String(Math.floor(left / 60)).padStart(2, '0') : null
  const ss = left != null ? String(left % 60).padStart(2, '0') : null
  const expired = left === 0
  return (
    <main className="page page-enter">
      <BookingStepper step={3} />
      <header className="page-header">
        <div className="page-header-copy">
          <span className="page-overline">Secure checkout</span>
          <h1>Review and pay</h1>
          <p>Your seats are reserved under PNR <b className="t-num">{booking.pnr_number}</b> while you complete payment.</p>
        </div>
        <div className={`hold-timer ${expired ? 'is-expired' : left != null && left < 120 ? 'is-urgent' : ''}`} role="timer" aria-live="off">
          <Icon name="clock" size={18} />
          {left != null ? (
            <span><small>{expired ? 'Hold expired' : 'Seats held for'}</small><b className="t-num">{mm}:{ss}</b></span>
          ) : (
            <span><small>Seats held for</small><b>{booking.holdMinutes || 10} min</b></span>
          )}
        </div>
      </header>
      <div className="booking-layout">
        <form className="payment card" onSubmit={(e) => confirm(e, method)}>
          <h2 className="payment-title">Payment method</h2>
          <div className="pay-methods" role="radiogroup" aria-label="Payment method">
            {METHODS.map(([x, icon, hint]) => (
              <label className={`pay-method ${method === x ? 'is-selected' : ''}`} key={x}>
                <input type="radio" name="pay" checked={method === x} onChange={() => setMethod(x)} />
                <span className="pay-method-icon"><Icon name={icon} size={20} /></span>
                <span className="grow"><b>{x}</b><small>{hint}</small></span>
                <span className="pay-method-check"><Icon name="check" size={13} strokeWidth={3} /></span>
              </label>
            ))}
          </div>

          <div className="pay-fields" key={method}>
            {method === 'Mobile Banking' && (
              <div className="form-row">
                <label>Mobile number<input required inputMode="numeric" placeholder="01XXXXXXXXX" pattern="01[0-9]{9}" title="11-digit number starting with 01" /></label>
                <label>Transaction reference<input name="transactionId" required placeholder="Transaction ID" /></label>
              </div>
            )}
            {method === 'Card' && (
              <>
                <label>Card number<input required inputMode="numeric" autoComplete="cc-number" placeholder="16-digit card number" pattern="[0-9]{16}" maxLength={16} onInput={(event) => restrictDigits(event, 16)} /></label>
                <div className="form-row">
                  <label>Expiry<input required inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])/[0-9]{2}" maxLength={5} onInput={formatFutureCardExpiry} /></label>
                  <label>CVV<input required inputMode="numeric" autoComplete="cc-csc" placeholder="123" pattern="[0-9]{3}" maxLength={3} onInput={(event) => restrictDigits(event, 3)} /></label>
                </div>
              </>
            )}
            {method === 'Bank Transfer' && (
              <label>Bank reference<input name="transactionId" required placeholder="Transfer reference number" /></label>
            )}
          </div>

          <div className="fare-break">
            <div><span>Ticket fare · {booking.passengers?.length || search.passengers} seat{(booking.passengers?.length || search.passengers) > 1 ? 's' : ''}</span><b className="t-num">{money(total)}</b></div>
            <div><span>Service fee</span><b className="t-num">{money(0)}</b></div>
            <div className="fare-break-total"><span>Total to pay</span><b className="t-num">{money(total)}</b></div>
          </div>

          <p className="notice notice-brand"><Icon name="lock" size={17} /> Your payment details are used only to record this booking’s payment. Your ticket is issued once the payment is confirmed.</p>

          <div className="panel-actions">
            <Button variant="secondary" icon="arrowLeft" onClick={back}>Back</Button>
            <Button type="submit" size="lg" icon="lock" loading={paying} loadingText="Confirming payment…" disabled={expired}>
              Pay {money(total)}
            </Button>
          </div>
        </form>
        <Summary train={train} cls={cls} search={search} seatLabels={seatLabels} total={total} />
      </div>
    </main>
  )
}

/* ---------------------------------------------------------------- confirmation */

export function Confirmation({ booking, navigate }) {
  if (!booking)
    return (
      <main className="page page-enter">
        <div className="card">
          <EmptyState icon="ticket" title="No recent booking to show" description="Your confirmed tickets are always available in My tickets." action={<Button icon="wallet" onClick={() => navigate('tickets')}>Open my tickets</Button>} />
        </div>
      </main>
    )
  const seats = (booking.passengers || []).map((p) => `${p.coach_code}-${p.seat_number}`)
  const download = () => {
    const text = `FERROVIA E-Ticket\nPNR: ${booking.pnr_number}\nTrain: ${booking.train_name}\nRoute: ${booking.source_station} to ${booking.destination_station}\nDeparture: ${fmtDate(booking.scheduled_departure)} ${fmtTime(booking.scheduled_departure)}\nSeat: ${seats.join(', ')}\nFare: ${money(booking.total_fare)}`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = `ticket-${booking.pnr_number}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <main className="page page-enter">
      <BookingStepper step={4} />
      <section className="confirm">
        <div className="confirm-head">
          <span className="confirm-check" aria-hidden="true">
            <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="m15 27 7.5 7.5L38 19" /></svg>
          </span>
          <div>
            <h1>You’re booked.</h1>
            <p>Payment confirmed and your seats are reserved. Reference <CopyChip value={booking.pnr_number} /></p>
          </div>
        </div>
        <Ticket booking={{ ...booking, booking_status: booking.booking_status || 'CONFIRMED' }} animate />
        <div className="confirm-actions no-print">
          <Button icon="wallet" onClick={() => navigate('tickets')}>View my tickets</Button>
          <Button variant="secondary" icon="print" onClick={() => window.print()}>Print</Button>
          <Button variant="secondary" icon="download" onClick={download}>Download</Button>
          <Button variant="ghost" icon="chart" onClick={() => navigate('dashboard')}>Go to dashboard</Button>
        </div>
      </section>
    </main>
  )
}

