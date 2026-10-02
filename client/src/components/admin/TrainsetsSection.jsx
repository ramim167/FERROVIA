export default function TrainsetsSection({ form, stations, updateTrainset, addTrainset, removeTrainset }) {
  return (<section className="admin-train-section" id="service-trainsets">
        <div className="admin-stop-head">
          <div>
            <span className="eyebrow">
              Physical fleet
            </span>

            <h3>Trainsets</h3>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={addTrainset}
          >
            + Add trainset
          </button>
        </div>

        {form.trainsets.map(
          (item, index) =>
            <div
              className="admin-repeat-row"
              key={index}
            >
              <input
                required
                placeholder={`Trainset code ${
                  index + 1
                }`}
                value={
                  item.trainsetCode
                }
                onChange={event =>
                  updateTrainset(
                    index,
                    'trainsetCode',
                    event.target.value
                  )
                }
              />

              <select
                aria-label="Trainset status"
                value={item.status}
                onChange={event =>
                  updateTrainset(
                    index,
                    'status',
                    event.target.value
                  )
                }
              >
                <option value="SPARE">
                  SPARE
                </option>

                <option value="MAINTENANCE">
                  MAINTENANCE
                </option>

                <option value="OUT_OF_SERVICE">
                  OUT OF SERVICE
                </option>
              </select>

              <select
                aria-label="Trainset current station"
                required
                value={
                  item.currentStationId
                }
                onChange={event =>
                  updateTrainset(
                    index,
                    'currentStationId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Initial terminal
                </option>

                {[
                  form.routes.up
                    .sourceStationId,
                  form.routes.up
                    .destinationStationId
                ]
                  .filter(Boolean)
                  .map(id => {
                    const station =
                      stations.find(
                        item =>
                          Number(
                            item.station_id
                          ) === Number(id)
                      )

                    return (
                      <option
                        value={id}
                        key={id}
                      >
                        {
                          station
                            ?.station_name
                        }
                      </option>
                    )
                  })}
              </select>

              <button
                type="button"
                className="admin-remove"
                onClick={() =>
                  removeTrainset(index)
                }
              >
                ×
              </button>
            </div>
        )}
      </section>)
}
