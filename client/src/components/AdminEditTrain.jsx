import { useEffect, useState } from 'react'
import { Icon } from './Icons'
import { api } from '../lib/api'


function minuteToTime(value) {
    const total = Number(value)

    if (!Number.isFinite(total)) {
        return '—'
    }

    const normalized =
        ((total % 1440) + 1440) % 1440

    const hours = Math.floor(normalized / 60)
    const minutes = normalized % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export default function AdminEditTrain({
    user,
    handleError,
    setToast
}) {
    const [selectedTrainId, setSelectedTrainId] = useState('')
    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(false)
    const [trainData, setTrainData] = useState(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')

    const [basicForm, setBasicForm] = useState({
        trainName: '',
        trainCode: '',
        trainType: '',
        trainStatus: 'ACTIVE',
        spareTriggerDelayMin: '60',
    })

    const [savingBasic, setSavingBasic] = useState(false)

    useEffect(() => {

        if (user?.role !== 'ADMIN') return

        async function loadTrains() {

            setLoading(true)

            try {

                const data = await api('/admin/train-services')

                setTrains(data || [])

            } catch (error) {

                handleError(error)

            } finally {

                setLoading(false)

            }
        }

        loadTrains()

    }, [user, handleError])

    async function loadTrainDetails(trainId) {

        if (!trainId) {

            setTrainData(null)

            setBasicForm({
                trainName: '',
                trainCode: '',
                trainType: '',
                trainStatus: 'ACTIVE',
                spareTriggerDelayMin: '60',
            })

            return
        }

        setDetailsLoading(true)

        try {

            const data = await api(
                `/admin/train-services/${trainId}`
            )

            setTrainData(data)

            setBasicForm({
                trainName: data.train.train_name || '',
                trainCode: data.train.train_code || '',
                trainType: data.train.train_type || '',
                trainStatus: data.train.train_status || 'ACTIVE',
                spareTriggerDelayMin: String(
                    data.train.spare_trigger_delay_min ?? 60
                ),
            })

        } catch (error) {

            setTrainData(null)
            handleError(error)

        } finally {

            setDetailsLoading(false)

        }
    }

    async function saveBasicInfo(e) {

        e.preventDefault()

        if (!selectedTrainId) return

        setSavingBasic(true)

        try {

            const data = await api(
                `/admin/train-services/${selectedTrainId}`,
                {
                    method: 'PATCH',

                    body: {
                        trainName: basicForm.trainName,
                        trainCode: basicForm.trainCode,
                        trainType: basicForm.trainType,
                        trainStatus: basicForm.trainStatus,
                        spareTriggerDelayMin:
                            Number(basicForm.spareTriggerDelayMin),
                    },
                }
            )


            setTrainData(current => ({
                ...current,
                train: data.train,
            }))


            setTrains(current =>
                current.map(train =>
                    Number(train.train_id) === Number(selectedTrainId)
                        ? {
                            ...train,
                            ...data.train,
                        }
                        : train
                )
            )


            setToast('Train basic information updated')

        } catch (error) {

            handleError(error)

        } finally {

            setSavingBasic(false)

        }
    }

    if (user?.role !== 'ADMIN') {
        return (
            <main className="page">
                <div className="card access-card">
                    <Icon name="shield" size={36} />
                    <h2>Admin access required</h2>
                    <p>
                        Only ADMIN accounts can edit train information.
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="page">

            <div className="page-title">
                <span className="eyebrow">
                    ADMIN • TRAIN MANAGEMENT
                </span>

                <h1>Edit Existing Train</h1>

                <p>
                    Select an existing train to manage its information,
                    routes, trainsets, fares, coaches and seats.
                </p>
            </div>

            <section className="card admin-train-selector">

                <label>
                    Select train

                    <select
                        value={selectedTrainId}
                        disabled={loading}
                        onChange={e => {

                            const trainId = e.target.value

                            setSelectedTrainId(trainId)
                            setActiveTab('basic')
                            loadTrainDetails(trainId)

                        }}
                    >

                        <option value="">
                            {loading
                                ? 'Loading trains...'
                                : 'Select existing train'}
                        </option>

                        {trains.map(train => (

                            <option
                                key={train.train_id}
                                value={train.train_id}
                            >
                                {train.train_name}
                                {' • '}
                                {train.train_code}
                                {' • '}
                                {train.train_status}
                            </option>

                        ))}

                    </select>
                </label>

            </section>

            {!selectedTrainId &&
                <section className="card empty">
                    <Icon name="train" size={40} />
                    <h2>Select a train</h2>
                    <p>
                        Train configuration will appear here after selection.
                    </p>
                </section>
            }
            {detailsLoading &&
                <section className="card empty">
                    <p>Loading train configuration...</p>
                </section>
            }


            {trainData && !detailsLoading &&
                <section className="card admin-edit-heading">

                    <div>

                        <span className="eyebrow">
                            TRAIN #{trainData.train.train_id}
                        </span>

                        <h2>
                            {trainData.train.train_name}
                        </h2>

                        <p>
                            {trainData.train.train_code}
                            {' • '}
                            {trainData.train.train_type}
                            {' • '}
                            {trainData.train.train_status}
                        </p>

                    </div>

                </section>
            }
            {trainData && !detailsLoading &&
                <div className="admin-edit-tabs">

                    <button
                        className={activeTab === 'basic' ? 'active' : ''}
                        onClick={() => setActiveTab('basic')}
                    >
                        Basic Info
                    </button>

                    <button
                        className={activeTab === 'routes' ? 'active' : ''}
                        onClick={() => setActiveTab('routes')}
                    >
                        Routes & Schedule
                    </button>

                    <button
                        className={activeTab === 'trainsets' ? 'active' : ''}
                        onClick={() => setActiveTab('trainsets')}
                    >
                        Trainsets
                    </button>

                    <button
                        className={activeTab === 'fares' ? 'active' : ''}
                        onClick={() => setActiveTab('fares')}
                    >
                        Fares
                    </button>

                    <button
                        className={activeTab === 'coaches' ? 'active' : ''}
                        onClick={() => setActiveTab('coaches')}
                    >
                        Coaches & Seats
                    </button>

                </div>
            }
            {trainData && !detailsLoading && activeTab === 'basic' &&

                <form
                    className="card contact admin-edit-section"
                    onSubmit={saveBasicInfo}
                >

                    <h2>Basic Information</h2>

                    <p>
                        Update the permanent information for this train service.
                    </p>


                    <label>
                        Train Name

                        <input
                            required
                            value={basicForm.trainName}
                            onChange={e =>
                                setBasicForm(current => ({
                                    ...current,
                                    trainName: e.target.value,
                                }))
                            }
                            placeholder="Example: Suborno Express"
                        />

                    </label>


                    <label>
                        Train Code

                        <input
                            required
                            value={basicForm.trainCode}
                            onChange={e =>
                                setBasicForm(current => ({
                                    ...current,
                                    trainCode: e.target.value,
                                }))
                            }
                            placeholder="Example: SUBORNO"
                        />

                    </label>


                    <label>
                        Train Type

                        <input
                            required
                            value={basicForm.trainType}
                            onChange={e =>
                                setBasicForm(current => ({
                                    ...current,
                                    trainType: e.target.value,
                                }))
                            }
                            placeholder="Example: INTERCITY"
                        />

                    </label>


                    <label>
                        Train Status

                        <select
                            required
                            value={basicForm.trainStatus}
                            onChange={e =>
                                setBasicForm(current => ({
                                    ...current,
                                    trainStatus: e.target.value,
                                }))
                            }
                        >

                            <option value="ACTIVE">
                                ACTIVE
                            </option>

                            <option value="INACTIVE">
                                INACTIVE
                            </option>

                            <option value="CANCELLED">
                                CANCELLED
                            </option>

                        </select>

                    </label>


                    <label>
                        Spare Trigger Delay (minutes)

                        <input
                            required
                            type="number"
                            min="0"
                            step="1"
                            value={basicForm.spareTriggerDelayMin}
                            onChange={e =>
                                setBasicForm(current => ({
                                    ...current,
                                    spareTriggerDelayMin: e.target.value,
                                }))
                            }
                        />

                    </label>


                    <button
                        type="submit"
                        className="primary"
                        disabled={savingBasic}
                    >

                        {savingBasic
                            ? 'Saving...'
                            : 'Save Changes'}

                    </button>

                </form>
            }

            {trainData && !detailsLoading && activeTab === 'routes' &&
                <section className="admin-edit-section">

                    <div className="card">

                        <h2>Routes & Schedule</h2>

                        <p>
                            Permanent UP/DOWN route definitions, running days
                            and station timetable offsets.
                        </p>

                    </div>


                    {trainData.routes.length === 0 &&
                        <section className="card empty">

                            <Icon name="train" size={36} />

                            <h3>No routes configured</h3>

                            <p>
                                This train currently has no route definition.
                            </p>

                        </section>
                    }


                    {trainData.routes.map(route => {

                        const stops = trainData.routeStops
                            .filter(
                                stop =>
                                    Number(stop.route_id) ===
                                    Number(route.route_id)
                            )
                            .sort(
                                (a, b) =>
                                    Number(a.stop_sequence) -
                                    Number(b.stop_sequence)
                            )


                        const runningDays = trainData.runningDays
                            .filter(
                                day =>
                                    Number(day.route_id) ===
                                    Number(route.route_id)
                            )


                        return (
                            <section
                                className="card"
                                key={route.route_id}
                            >

                                <div>

                                    <span className="eyebrow">
                                        {route.direction} ROUTE
                                    </span>

                                    <h2>
                                        {route.source_station}
                                        {' → '}
                                        {route.destination_station}
                                    </h2>

                                    <p>
                                        Train No: {route.train_number || '—'}
                                        {' • '}
                                        Route Code: {route.route_code}
                                        {' • '}
                                        {Number(route.is_active) === 1
                                            ? 'ACTIVE'
                                            : 'INACTIVE'}
                                    </p>

                                </div>


                                <hr />


                                <h3>Running Schedule</h3>

                                {runningDays.length === 0
                                    ? (
                                        <p>No running days configured.</p>
                                    )
                                    : (
                                        <div>

                                            {runningDays.map(day => (
                                                <p key={day.running_day_id}>

                                                    <strong>
                                                        {day.day_code}
                                                    </strong>

                                                    {' • Departure '}

                                                    {minuteToTime(
                                                        day.departure_minute
                                                    )}

                                                </p>
                                            ))}

                                        </div>
                                    )
                                }


                                <hr />


                                <h3>Route Stops</h3>


                                {stops.length === 0
                                    ? (
                                        <p>No stops configured.</p>
                                    )
                                    : (
                                        <div style={{ overflowX: 'auto' }}>

                                            <table>

                                                <thead>

                                                    <tr>
                                                        <th>#</th>
                                                        <th>Station</th>
                                                        <th>Arrival</th>
                                                        <th>Departure</th>
                                                        <th>Distance</th>
                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {stops.map(stop => (

                                                        <tr key={stop.route_stop_id}>

                                                            <td>
                                                                {stop.stop_sequence}
                                                            </td>

                                                            <td>
                                                                {stop.station_name}
                                                            </td>

                                                            <td>
                                                                {stop.arrival_offset_min == null
                                                                    ? '—'
                                                                    : `+${stop.arrival_offset_min} min`}
                                                            </td>

                                                            <td>
                                                                {stop.departure_offset_min == null
                                                                    ? '—'
                                                                    : `+${stop.departure_offset_min} min`}
                                                            </td>

                                                            <td>
                                                                {stop.distance_from_source_km == null
                                                                    ? '—'
                                                                    : `${stop.distance_from_source_km} km`}
                                                            </td>

                                                        </tr>

                                                    ))}

                                                </tbody>

                                            </table>

                                        </div>
                                    )
                                }

                            </section>
                        )
                    })}

                </section>
            }

            {trainData && !detailsLoading && activeTab === 'trainsets' &&
                <section className="card admin-edit-section">
                    <h2>Trainsets</h2>
                    <p>Physical trainset management will appear here.</p>
                </section>
            }

            {trainData && !detailsLoading && activeTab === 'fares' &&
                <section className="card admin-edit-section">
                    <h2>Fare Rules</h2>
                    <p>Fare editing controls will appear here.</p>
                </section>
            }

            {trainData && !detailsLoading && activeTab === 'coaches' &&
                <section className="card admin-edit-section">
                    <h2>Coaches & Seats</h2>
                    <p>Coach and seat management will appear here.</p>
                </section>
            }

        </main>
    )
}