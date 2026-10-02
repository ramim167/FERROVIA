export default function BasicSection({ form, setForm }) {
  return (<section className="admin-train-section" id="service-basic">
        <h3>Basic information</h3>

        <div className="admin-train-grid">
          <label>
            Train name
            <input
              required
              placeholder="Suborno Express"
              value={form.trainName}
              onChange={event =>
                setForm({
                  ...form,
                  trainName:
                    event.target.value
                })
              }
            />
          </label>

          <label>
            Service code
            <input
              required
              placeholder="SUBORNO"
              value={form.trainCode}
              onChange={event =>
                setForm({
                  ...form,
                  trainCode:
                    event.target.value
                })
              }
            />
          </label>

          <label>
            Train type
            <select
              value={form.trainType}
              onChange={event =>
                setForm({
                  ...form,
                  trainType:
                    event.target.value
                })
              }
            >
              <option value="INTERCITY">
                Intercity
              </option>

              <option value="MAIL">
                Mail
              </option>

              <option value="LOCAL">
                Local
              </option>

              <option value="COMMUTER">
                Commuter
              </option>

              <option value="MIXED">
                Mixed
              </option>

              <option value="SHUTTLE">
                Shuttle
              </option>
            </select>
          </label>

          <label>
            Status
            <select
              value={form.trainStatus}
              onChange={event =>
                setForm({
                  ...form,
                  trainStatus:
                    event.target.value
                })
              }
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </label>

          <label>
            Spare trigger delay
            <input
              type="number"
              min="0"
              required
              value={
                form.spareTriggerDelayMin
              }
              onChange={event =>
                setForm({
                  ...form,
                  spareTriggerDelayMin:
                    event.target.value
                })
              }
            />
          </label>
        </div>
      </section>)
}
