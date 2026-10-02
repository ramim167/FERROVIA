import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icons'
import { SymbolMark } from './brand/Logo'
import { api } from '../lib/api'

const starterMessages = [
  {
    role: 'assistant',
    text: 'Hi, I’m Conduttore. Ask me about routes, off days, fares, seats or the live status of a train. I answer from FERROVIA’s timetable and trip records.',
  },
]

const suggestions = ['Rangpur Express ekhon koi?', 'Parjotak Express off day?', 'Dhaka to Chattogram tomorrow']

export default function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => { try { return JSON.parse(sessionStorage.getItem('ferrovia-chat')) || starterMessages } catch { return starterMessages } })
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const fabRef = useRef(null)

  useEffect(() => { try { sessionStorage.setItem('ferrovia-chat', JSON.stringify(messages.slice(-50))) } catch { /* Storage may be unavailable. */ } }, [messages])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('ferrovia:assistant', onOpen)
    return () => window.removeEventListener('ferrovia:assistant', onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); fabRef.current?.focus() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open, loading])

  const ask = async (text = draft) => {
    const message = text.trim()
    if (!message || loading) return
    setDraft('')
    setMessages((items) => [...items, { role: 'user', text: message }])
    setLoading(true)
    try {
      const data = await api('/chat', { method: 'POST', token: '', body: { message } })
      setMessages((items) => [...items, { role: 'assistant', text: data.message || 'I could not prepare a response.', source: data.mode }])
    } catch (err) {
      setMessages((items) => [...items, { role: 'assistant', error: true, text: err.message || 'The assistant is temporarily unavailable.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`assistant ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="assistant-panel" aria-label="Conduttore travel assistant" role="dialog">
          <header className="assistant-head">
            <svg viewBox="0 0 48 48" className="assistant-mark" aria-hidden="true"><SymbolMark tone="dark" /></svg>
            <div className="grow">
              <b>Conduttore</b>
              <small><span className="assistant-online" /> FERROVIA timetable assistant</small>
            </div>
            <button type="button" className="icon-btn icon-btn-sm" onClick={() => { setOpen(false); fabRef.current?.focus() }} aria-label="Close assistant">
              <Icon name="close" size={18} />
            </button>
          </header>

          <div className="assistant-messages" ref={listRef} aria-live="polite">
            {messages.map((item, index) => (
              <div className={`assistant-msg is-${item.role} ${item.error ? 'is-error' : ''}`} key={`${item.role}-${index}`}>
                <p>{item.text}</p>
                {item.source === 'database' && <span className="assistant-source"><Icon name="layers" size={12} /> From FERROVIA records</span>}
                {item.error && <span className="assistant-source"><Icon name="alert" size={12} /> Request failed — try again</span>}
              </div>
            ))}
            {loading && (
              <div className="assistant-msg is-assistant is-typing" aria-label="Conduttore is typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <div className="assistant-suggestions" aria-label="Suggested questions">
            {suggestions.map((item) => (
              <button type="button" key={item} onClick={() => ask(item)} disabled={loading}>{item}</button>
            ))}
          </div>

          <form className="assistant-compose" onSubmit={(e) => { e.preventDefault(); ask() }}>
            <label className="sr-only" htmlFor="assistant-input">Message Conduttore</label>
            <input id="assistant-input" ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about a train, route or fare…" maxLength={1000} autoComplete="off" />
            <button type="submit" disabled={loading || !draft.trim()} aria-label="Send message">
              <Icon name="arrow" size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        ref={fabRef}
        className="assistant-fab"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Conduttore assistant' : 'Open Conduttore assistant'}
        aria-expanded={open}
      >
        {open ? <Icon name="close" size={22} /> : <Icon name="bot" size={24} />}
        {!open && <span className="assistant-fab-label">Ask Conduttore</span>}
      </button>
    </div>
  )
}
