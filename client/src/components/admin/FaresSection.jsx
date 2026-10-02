export default function FaresSection({ form, classes, addFare, updateFare, removeFare }) {
  return (<section className="admin-train-section" id="service-fares">
        <div className="admin-stop-head">
          <div>
            <span className="eyebrow">
              Pricing
            </span>

            <h3>Class fares</h3>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={addFare}
          >
            + Add fare
          </button>
        </div>

        {form.fares.map(
          (fare, index) =>
            <div
              className="admin-repeat-row"
              key={index}
            >
              <select
                aria-label="Fare class"
                required
                value={fare.classId}
                onChange={event =>
                  updateFare(
                    index,
                    'classId',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Class
                </option>

                {classes.map(item =>
                  <option
                    key={item.class_id}
                    value={item.class_id}
                  >
                    {item.class_name}
                  </option>
                )}
              </select>

              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Base fare"
                value={fare.baseFare}
                onChange={event =>
                  updateFare(
                    index,
                    'baseFare',
                    event.target.value
                  )
                }
              />

              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Rate / km"
                value={fare.ratePerKm}
                onChange={event =>
                  updateFare(
                    index,
                    'ratePerKm',
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="admin-remove"
                disabled={
                  form.fares.length <= 1
                }
                onClick={() =>
                  removeFare(index)
                }
              >
                ×
              </button>
            </div>
        )}
      </section>)
}
