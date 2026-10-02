export default function CoachesSection({ form, classes, addCoach, updateCoach, removeCoach }) {
  return (<section className="admin-train-section" id="service-coaches">
        <div className="admin-stop-head">
          <div>
            <span className="eyebrow">
              Seat layout
            </span>

            <h3>Coaches & seats</h3>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={addCoach}
          >
            + Add coach
          </button>
        </div>

        {form.coaches.map(
          (coach, index) =>
            <div
              className="admin-repeat-row coach-row"
              key={index}
            >
              <input
                required
                placeholder="Coach code e.g. A"
                value={
                  coach.coachCode
                }
                onChange={event =>
                  updateCoach(
                    index,
                    'coachCode',
                    event.target.value
                  )
                }
              />

              <select
                aria-label="Coach class"
                required
                value={coach.classId}
                onChange={event =>
                  updateCoach(
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
                min="1"
                placeholder="Seat count"
                value={
                  coach.seatCount
                }
                onChange={event =>
                  updateCoach(
                    index,
                    'seatCount',
                    event.target.value
                  )
                }
              />

              <select
                aria-label="Seat type"
                value={coach.seatType}
                onChange={event =>
                  updateCoach(
                    index,
                    'seatType',
                    event.target.value
                  )
                }
              >
                <option value="REGULAR">
                  Regular
                </option>

                <option value="WINDOW">
                  Window
                </option>

                <option value="AISLE">
                  Aisle
                </option>

                <option value="MIDDLE">
                  Middle
                </option>

                <option value="BERTH">
                  Berth
                </option>
              </select>

              <button
                type="button"
                className="admin-remove"
                disabled={
                  form.coaches.length <= 1
                }
                onClick={() =>
                  removeCoach(index)
                }
              >
                ×
              </button>
            </div>
        )}
      </section>)
}
