/** RFC 5545 calendar event built only from the confirmed booking. */
export function downloadJourneyCalendar(booking) {
  const escape = value => String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, '\\$&')
  const stamp = value => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FERROVIA//Journey//EN', 'BEGIN:VEVENT',
    `UID:${escape(booking.pnr_number)}@ferrovia.local`, `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(booking.scheduled_departure)}`, `DTEND:${stamp(booking.scheduled_arrival)}`,
    `SUMMARY:${escape(`${booking.train_name}: ${booking.source_station} to ${booking.destination_station}`)}`,
    `LOCATION:${escape(booking.source_station)}`, `DESCRIPTION:${escape(`PNR ${booking.pnr_number}`)}`,
    'END:VEVENT', 'END:VCALENDAR']
  const url = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = `ferrovia-${booking.pnr_number}.ics`; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
