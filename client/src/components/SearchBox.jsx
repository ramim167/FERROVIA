import { useEffect, useId, useRef, useState } from 'react'
import { Icon } from './Icons'
import DatePicker from './DatePicker'

function Autocomplete({ options, value, onChange, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef(null)
  const listId = useId()
  const term = (value || '').toLowerCase()
  const filteredOptions = options
    .filter((o) => o.name.toLowerCase().includes(term) || (o.code || '').toLowerCase() === term)
    .slice(0, 30)

  useEffect(() => {
    const close = (event) => { if (!wrapperRef.current?.contains(event.target)) setIsOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (isOpen && activeIndex >= 0) document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen, listId])

  const choose = (option) => { onChange(option.name); setIsOpen(false); setActiveIndex(-1) }
  const onKeyDown = (event) => {
    if (event.key === 'Escape') { setIsOpen(false); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => {
        if (!filteredOptions.length) return -1
        return event.key === 'ArrowDown' ? (index + 1) % filteredOptions.length : index <= 0 ? filteredOptions.length - 1 : index - 1
      })
    } else if (event.key === 'Enter' && isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
      event.preventDefault()
      choose(filteredOptions[activeIndex])
    }
  }

  return (
    <div className="station-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        required
        placeholder={placeholder}
        value={value || ''}
        onChange={(event) => { onChange(event.target.value); setActiveIndex(-1); setIsOpen(true) }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={onKeyDown}
      />
      {isOpen && (
        <ul id={listId} role="listbox" className="station-suggestions">
          {filteredOptions.length ? (
            filteredOptions.map((option, index) => (
              <li
                role="option"
                id={`${listId}-${index}`}
                aria-selected={activeIndex === index}
                className={activeIndex === index ? 'active' : ''}
                key={option.name}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                <Icon name="mapPin" size={16} />
                <span>{option.name}</span>
                {option.code && <span className="station-code" aria-hidden="true">{option.code}</span>}
              </li>
            ))
          ) : (
            <li className="station-no-results" role="presentation">No station matches “{value}”</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default function SearchBox({ search, setSearch, onSubmit, compact = false, stations = [] }) {
  const [spin, setSpin] = useState(0)
  const swap = () => { setSpin((n) => n + 1); setSearch((s) => ({ ...s, from: s.to, to: s.from })) }
  const options = stations.length
    ? stations.map((s) => ({ name: s.station_name, code: s.station_code }))
    : [search.from, search.to].filter(Boolean).map((name) => ({ name }))

  return (
    <form className={`search-box ${compact ? 'is-compact' : ''}`} onSubmit={(e) => { e.preventDefault(); onSubmit() }} role="search" aria-label="Search trains">
      <div className="search-stations">
        <label className="search-field">
          <span className="search-field-label">From</span>
          <span className="search-field-control">
            <span className="search-node" aria-hidden="true" />
            <Autocomplete options={options} value={search.from} onChange={(val) => setSearch({ ...search, from: val })} placeholder="From where?" label="Departure station" />
          </span>
        </label>
        <button type="button" className="search-swap" onClick={swap} title="Swap stations" aria-label="Swap departure and arrival stations" style={{ '--spin': `${spin * 180}deg` }}>
          <Icon name="swap" size={18} />
        </button>
        <label className="search-field">
          <span className="search-field-label">To</span>
          <span className="search-field-control">
            <span className="search-node is-end" aria-hidden="true" />
            <Autocomplete options={options} value={search.to} onChange={(val) => setSearch({ ...search, to: val })} placeholder="To where?" label="Arrival station" />
          </span>
        </label>
      </div>
      <div className="search-field search-date">
        <span className="search-field-label" id="journey-date-label">Journey date</span>
        <DatePicker ariaLabel="Journey date" value={search.date} onChange={(date) => setSearch({ ...search, date })} />
      </div>
      <label className="search-field search-pax">
        <span className="search-field-label">Travellers</span>
        <span className="input-icon">
          <Icon name="users" size={17} />
          <select aria-label="Passengers" value={search.passengers} onChange={(e) => setSearch({ ...search, passengers: +e.target.value })}>
            {[1, 2, 3, 4].map((n) => <option value={n} key={n}>{n} passenger{n > 1 ? 's' : ''}</option>)}
          </select>
        </span>
      </label>
      <button type="submit" className="btn btn-primary btn-lg search-submit">
        <Icon name="search" size={19} />
        <span className="btn-label">Search trains</span>
      </button>
    </form>
  )
}
