import { useState } from 'react'
import { Icon } from '../components/Icons'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Feedback'
import { PageHeader } from '../components/ui/Layout'

const FAQ = [
  ['How do I book a ticket?', 'Choose your route and travel date, compare trains and classes, select your seats, add passenger details and complete payment. Your ticket will be available in My tickets.'],
  ['How does live train tracking work?', 'Station teams record arrivals and departures. Tracking shows the last station left, the next stop and current delay as those updates arrive.'],
  ['When is a spare train assigned?', 'At 60 minutes or more delay, the destination-terminal spare trainset is reserved for the next opposite-direction trip. The delayed train completes its current journey and becomes the new spare.'],
  ['How are refunds handled?', 'Cancellation requests are reviewed by an admin. Approved requests receive 70% within 24 hours of booking, 50% within 24–72 hours, and 20% after 72 hours. No refund applies when departure is within 24 hours.'],
  ['Where can I find my PNR?', 'Your PNR appears on your confirmed ticket. Open My tickets and select your booking to see its reference and journey details.'],
]

export default function Support({ setToast }) {
  const [query, setQuery] = useState('')
  const results = FAQ.filter(([q, a]) => `${q} ${a}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <main className="page page-enter">
      <PageHeader overline="Help centre" title="How can we help?" description="Find answers to travel questions or prepare a note about your booking." />
      <label className="support-search">
        <Icon name="search" size={20} />
        <span className="sr-only">Search help articles</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search refunds, PNR, tracking…" />
      </label>
      <div className="support-grid">
        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className="support-heading">Frequently asked questions</h2>
          {results.length ? (
            <div className="accordion">
              {results.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}<Icon name="chevron" size={18} /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          ) : (
            <div className="card"><EmptyState compact icon="search" title="No answers match your search" description="Try another word or ask Conduttore about a train, route or fare." /></div>
          )}
          <button type="button" className="support-assistant" onClick={() => window.dispatchEvent(new CustomEvent('ferrovia:assistant'))}>
            <span className="bento-icon tone-info"><Icon name="bot" size={20} /></span>
            <span className="grow"><b>Ask Conduttore</b><small>Get answers about trains, off days and fares from FERROVIA records.</small></span>
            <Icon name="arrow" size={18} />
          </button>
        </section>
        <form
          className="card support-form"
          onSubmit={(e) => {
            e.preventDefault()
            const fields = new FormData(e.currentTarget)
            const note = `FERROVIA support note\n\nName: ${fields.get('name')}\nEmail: ${fields.get('email')}\nTopic: ${fields.get('topic')}\n\n${fields.get('message')}\n`
            const url = URL.createObjectURL(new Blob([note], { type: 'text/plain;charset=utf-8' }))
            const link = document.createElement('a')
            link.href = url; link.download = 'ferrovia-support-note.txt'
            document.body.appendChild(link); link.click(); link.remove()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            setToast('Support note downloaded. It has not been sent.')
          }}
        >
          <div>
            <h2 className="support-heading">Prepare a support note</h2>
            <p className="secondary-text">Save the details for your records. Include your PNR if it’s about a booking.</p>
          </div>
          <p className="notice notice-info"><Icon name="info" size={17} /> This website cannot send support requests yet. Downloading a note saves it on your device only.</p>
          <div className="form-row">
            <label>Name<input name="name" required placeholder="Your name" autoComplete="name" /></label>
            <label>Email<input name="email" required type="email" placeholder="you@example.com" autoComplete="email" /></label>
          </div>
          <label>Topic
            <select name="topic">
              <option>Booking issue</option>
              <option>Payment</option>
              <option>Live tracking</option>
              <option>Cancellation / refund</option>
            </select>
          </label>
          <label>Message<textarea name="message" required rows="5" placeholder="How can we help?" /></label>
          <Button type="submit" iconRight="download">Download note</Button>
        </form>
      </div>
    </main>
  )
}
