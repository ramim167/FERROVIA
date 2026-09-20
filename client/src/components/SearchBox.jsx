import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icons'
import DatePicker from './DatePicker'

// সার্চএবল ড্রপডাউনের জন্য নতুন একটি কম্পোনেন্ট
function Autocomplete({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [hasSelection, setHasSelection] = useState(Boolean(value))
  const wrapperRef = useRef(null)

  // যখন বাইরে থেকে (যেমন Swap বাটনে) ভ্যালু চেঞ্জ হবে, তখন ইনপুট আপডেট করার জন্য
  useEffect(() => {
    setInputValue(value || '')
    setHasSelection(Boolean(value))
    setIsOpen(false)
  }, [value])

  // ড্রপডাউনের বাইরে ক্লিক করলে যেন সেটি বন্ধ হয়ে যায়
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ইনপুট ফাঁকা থাকলে কোনো অপশন দেখাবে না, কিছু লিখলে তবেই শুধু শুরু থেকে ফিল্টার করবে
  const filteredOptions = inputValue.trim() === '' 
    ? [] 
    : options.filter(opt =>
        opt.toLowerCase().startsWith(inputValue.toLowerCase())
      )

  return (
    <div className="station-autocomplete" ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setHasSelection(false)
          setIsOpen(true)
        }}
        onFocus={() => {
          if (!hasSelection && inputValue.trim()) setIsOpen(true)
        }}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 'inherit',
          color: 'inherit'
        }}
      />
      {isOpen && !hasSelection && filteredOptions.length > 0 && (
        <ul
          className="station-suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: '-10px',
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'white',
            zIndex: 100,
            listStyle: 'none',
            padding: 0,
            margin: '5px 0 0 0',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            border: '1px solid #eee'
          }}
        >
          {filteredOptions.map(opt => (
            <li
              key={opt}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setInputValue(opt)
                setHasSelection(true)
                setIsOpen(false)
                onChange(opt)
              }}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5',
                color: '#333'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f4f6f8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SearchBox({ search, setSearch, onSubmit, compact = false, stations = [] }) {
  const swap = () => setSearch(s => ({ ...s, from: s.to, to: s.from }))
  const names = stations.length ? stations.map(s => s.station_name) : [search.from, search.to].filter(Boolean)
  const now = new Date(), minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  return (
    <form className={`search-box ${compact ? 'compact' : ''}`} onSubmit={e => { e.preventDefault(); onSubmit() }}>
      <label>
        <span>Departure station</span>
        <div className="field-wrap">
          <Icon name="mapPin" size={17} />
          <Autocomplete
            options={names}
            value={search.from}
            onChange={val => setSearch({ ...search, from: val })}
            placeholder="From where?"
          />
        </div>
      </label>

      <button type="button" className="swap" onClick={swap} title="Swap stations">
        <Icon name="swap" size={18} />
      </button>

      <label>
        <span>Arrival station</span>
        <div className="field-wrap destination">
          <Icon name="mapPin" size={17} />
          <Autocomplete
            options={names}
            value={search.to}
            onChange={val => setSearch({ ...search, to: val })}
            placeholder="To where?"
          />
        </div>
      </label>

      <label>
        <span>Journey date</span>
        <DatePicker ariaLabel="Journey date" min={minDate} value={search.date} onChange={date => setSearch({ ...search, date })} />
      </label>

      <label>
        <span>Travellers</span>
        <div className="field-wrap">
          <Icon name="users" size={17} />
          <select aria-label="Passengers" value={search.passengers} onChange={e => setSearch({ ...search, passengers: +e.target.value })}>
            {[1, 2, 3, 4].map(n => <option value={n} key={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      </label>

      <button className="primary search-btn">
        <Icon name="search" size={18} /><span>Search trains</span><Icon name="arrow" size={18} />
      </button>
    </form>
  )
}
