const DAYS = [
  'SAT',
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI'
]


export default function RouteSection({ form, direction, label, stations, setRouteField, copyUpReverse, toggleDay, addStop, updateStop, removeStop }) {
  const route = form.routes[direction]
  return (<section className="admin-train-section" id={`service-${direction}`}>
          <div className="section-head">
            <div>
              <span className="eyebrow">
                {label === 'UP' ? 'Up' : 'Down'} route
              </span>

              <h3>
                {label} direction timetable
              </h3>
            </div>

            {direction === 'down' &&
              <button
                type="button"
                className="secondary"
                onClick={copyUpReverse}
              >
                Copy UP stops in reverse
              </button>
            }
          </div>

          <div className="admin-train-grid">
            <label>
              Train number
              <input
                required
                placeholder={
                  direction === 'up'
                    ? '701'
                    : '702'
                }
                value={route.trainNumber}
                onChange={event =>
                  setRouteField(
                    direction,
                    'trainNumber',
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Route code
              <input
                required
                placeholder={
                  direction === 'up'
                    ? 'SUB-UP'
                    : 'SUB-DOWN'
                }
                value={route.routeCode}
                onChange={event =>
                  setRouteField(
                    direction,
                    'routeCode',
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Source station
              <select
                required
                value={
                  route.sourceStationId
                }
                onChange={event =>
                  setRouteField(
                    direction,
                    'sourceStationId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select station
                </option>

                {stations.map(station =>
                  <option
                    key={station.station_id}
                    value={station.station_id}
                  >
                    {station.station_name}
                  </option>
                )}
              </select>
            </label>

            <label>
              Destination station
              <select
                required
                value={
                  route.destinationStationId
                }
                onChange={event =>
                  setRouteField(
                    direction,
                    'destinationStationId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select station
                </option>

                {stations.map(station =>
                  <option
                    key={station.station_id}
                    value={station.station_id}
                  >
                    {station.station_name}
                  </option>
                )}
              </select>
            </label>

            <label>
              Route departure
              <input
                required
                type="time"
                value={route.departureTime}
                onChange={event =>
                  setRouteField(
                    direction,
                    'departureTime',
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <div className="admin-days">
            <b>Running days</b>

            <div>
              {DAYS.map(day =>
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={
                      route.runningDays.includes(
                        day
                      )
                    }
                    onChange={() =>
                      toggleDay(
                        direction,
                        day
                      )
                    }
                  />

                  {day}
                </label>
              )}
            </div>
          </div>

          <div className="admin-stop-editor">
            <div className="admin-stop-head">
              <b>Stopping sequence</b>

              <button
                type="button"
                className="secondary"
                onClick={() =>
                  addStop(direction)
                }
              >
                + Add stop
              </button>
            </div>

            {route.stops.map(
              (stop, index) =>
                <div
                  className="admin-stop-row"
                  key={index}
                >
                  <strong>
                    {index + 1}
                  </strong>

                  <select
                    aria-label={`${label} stop ${index + 1} station`}
                    required
                    value={stop.stationId}
                    onChange={event =>
                      updateStop(
                        direction,
                        index,
                        'stationId',
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Station
                    </option>

                    {stations.map(station =>
                      <option
                        value={
                          station.station_id
                        }
                        key={
                          station.station_id
                        }
                      >
                        {station.station_name}
                      </option>
                    )}
                  </select>

                  <label>
                    Arrival
                    <input
                      type="time"
                      disabled={index === 0}
                      value={stop.arrivalTime}
                      onChange={event =>
                        updateStop(
                          direction,
                          index,
                          'arrivalTime',
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Departure
                    <input
                      type="time"
                      disabled={
                        index ===
                        route.stops.length - 1
                      }
                      value={
                        index === 0
                          ? route.departureTime
                          : stop.departureTime
                      }
                      onChange={event =>
                        updateStop(
                          direction,
                          index,
                          'departureTime',
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Distance km
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={stop.distanceKm}
                      onChange={event =>
                        updateStop(
                          direction,
                          index,
                          'distanceKm',
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-remove"
                    disabled={
                      index === 0 ||
                      index ===
                        route.stops.length - 1
                    }
                    onClick={() =>
                      removeStop(
                        direction,
                        index
                      )
                    }
                  >
                    ×
                  </button>
                </div>
            )}
          </div>
        </section>)
}
