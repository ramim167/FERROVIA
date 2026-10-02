import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { durationText, fmtTime, humanize, money } from '../lib/format'
import { Icon } from './Icons'
import { Badge, DelayBadge, SkeletonRows } from './ui/Feedback'
import { Drawer } from './ui/Overlay'
import { RouteLine, StopTimeline } from './ui/Rail'

/** Journey details drawer: classes plus the trip's real stop list. */
export default function TrainDetail({ train, close, choose }) {
  const [stops, setStops] = useState(null)
  useEffect(() => {
    let active = true
    api(`/trips/${train.trip_id}/stops`).then((rows) => active && setStops(rows)).catch(() => active && setStops([]))
    return () => { active = false }
  }, [train.trip_id])
  return (
    <Drawer title="Journey details" onClose={close} className="detail-drawer">
      <div className="stack">
        <div className="detail-head">
          <span className="journey-badge"><Icon name="train" size={20} /></span>
          <div className="grow">
            <h3>{train.train_name}</h3>
            <div className="journey-meta"><span className="t-code">{train.train_code}</span><span>{humanize(train.train_type)}</span><span>{train.direction}</span></div>
          </div>
          <DelayBadge minutes={train.current_delay_minutes} />
        </div>
        <RouteLine from={train.source_station} to={train.destination_station} departure={train.scheduled_departure} arrival={train.scheduled_arrival} duration={durationText(train.scheduled_departure, train.scheduled_arrival)} />
        {train.last_left_station && <p className="notice notice-warning"><Icon name="signal" size={16} /> Last left <b>{train.last_left_station}</b> at {fmtTime(train.last_left_at)}.</p>}

        <section>
          <h4 className="detail-sub">Choose a class</h4>
          <div className="detail-classes">
            {(train.classes || []).map((c) => (
              <button type="button" key={c.classId} className="fare-tile is-row" disabled={!c.availableSeats} onClick={() => choose(c)}>
                <span className="grow"><b>{humanize(c.className)}</b><span className="fare-tile-seats">{c.availableSeats ? `${c.availableSeats} seats left` : 'Sold out'}</span></span>
                <strong className="fare-tile-price t-num">{money(c.farePerPassenger)}</strong>
                {c.availableSeats > 0 && <Icon name="chevron" size={18} />}
              </button>
            ))}
            {!(train.classes || []).length && <p className="muted">No fares are configured for this trip.</p>}
          </div>
        </section>

        <section>
          <h4 className="detail-sub">Stops on this trip {stops?.length ? <Badge>{stops.length}</Badge> : null}</h4>
          {stops === null ? <SkeletonRows rows={3} /> : stops.length ? <StopTimeline stops={stops} /> : <p className="muted">Stop details are not available for this trip.</p>}
        </section>
      </div>
    </Drawer>
  )
}
