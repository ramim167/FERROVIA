import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import '@fontsource-variable/manrope'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/shell.css'
import './styles/scene.css'
import './styles/pages.css'
import './styles/admin.css'
import './styles/atmosphere.css'
import './styles/print.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toasts from './components/Toasts'
import Workspace from './components/Workspace'
import AiAssistant from './components/AiAssistant'
import AuthModal from './components/AuthModal'
import TrainDetail from './components/TrainDetail'
import Intro from './components/brand/Intro'
const AdminTrainServiceForm = lazy(() => import('./components/AdminTrainServiceForm'))
const AdminEditTrain = lazy(() => import('./components/AdminEditTrain'))
const AdminAssignTrip = lazy(() => import('./components/AdminAssignTrip'))
const AdminCancellationRequests = lazy(() => import('./components/AdminCancellationRequests'))
const AdminOperatorApprovals = lazy(() => import('./components/AdminOperatorApprovals'))
import { ConfirmProvider } from './components/ui/Overlay'
import { PageHeader } from './components/ui/Layout'
import Home from './pages/Home'
const Confirmation = lazy(() => import('./pages/Booking').then(module => ({ default: module.Confirmation })))
const PassengerPage = lazy(() => import('./pages/Booking').then(module => ({ default: module.PassengerPage })))
const PaymentPage = lazy(() => import('./pages/Booking').then(module => ({ default: module.PaymentPage })))
const SearchPage = lazy(() => import('./pages/Booking').then(module => ({ default: module.SearchPage })))
const SeatPage = lazy(() => import('./pages/Booking').then(module => ({ default: module.SeatPage })))
const Dashboard = lazy(() => import('./pages/Account').then(module => ({ default: module.Dashboard })))
const Tickets = lazy(() => import('./pages/Account').then(module => ({ default: module.Tickets })))
const NotificationsPage = lazy(() => import('./pages/Account').then(module => ({ default: module.NotificationsPage })))
const TrackTrain = lazy(() => import('./pages/Track'))
const OperatorPanel = lazy(() => import('./pages/Operator'))
const AdminOverview = lazy(() => import('./pages/AdminOverview'))
const Support = lazy(() => import('./pages/Support'))
import NotFound from './pages/NotFound'
import { animateUpdate, prefersReducedMotion } from './lib/motion'
import { api, clearSession, getStoredToken, storeSession } from './lib/api'
import { localToday } from './lib/format'
import { shouldPlayIntro } from './lib/intro'
import { WORKSPACE_PAGES } from './lib/roles'

function pageFromUrl() {
  const route = window.location.hash.replace(/^#\/?/, '').replace(/^admin\//, 'admin-') || 'home'
  return ['seats', 'passengers', 'payment', 'confirmation'].includes(route) ? 'search' : route
}

const initialSearch = { from: '', to: '', date: localToday(), passengers: 1 }

const PAGES = new Set([
  'home', 'search', 'seats', 'passengers', 'payment', 'confirmation', 'dashboard', 'tickets', 'track',
  'notifications', 'operator', 'admin', 'admin-add-train', 'admin-edit-train', 'admin-assign-trip',
  'admin-cancellations', 'admin-operator-approvals', 'support',
])

function initialTheme() {
  const stored = localStorage.getItem('ferrovia-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.visible)')
    if (prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          io.unobserve(entry.target)
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

function App() {
  const [page, setPage] = useState(pageFromUrl)
  const [search, setSearch] = useState(initialSearch)
  const [stations, setStations] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchError, setSearchError] = useState('')
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [seatList, setSeatList] = useState([])
  const [seats, setSeats] = useState([])
  const [passengers, setPassengers] = useState([])
  const [pendingBooking, setPendingBooking] = useState(null)
  const [lastBooking, setLastBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [notifications, setNotifications] = useState([])
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('rail-user') || 'null'))
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [authResume, setAuthResume] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('rail-favorites') || '[]'))
  const [detailTrain, setDetailTrain] = useState(null)
  const [theme, setTheme] = useState(initialTheme)
  const [intro, setIntro] = useState(shouldPlayIntro)
  useEffect(() => {
    const expired = () => {
      setUser(null); setBookings([]); setNotifications([])
      setError('Your session has ended. Sign in again to continue.')
    }
    window.addEventListener('ferrovia:session-expired', expired)
    return () => window.removeEventListener('ferrovia:session-expired', expired)
  }, [])

  useEffect(() => {
    const back = () => { setPage(pageFromUrl()); window.scrollTo(0, 0) }
    const visibility = () => document.documentElement.classList.toggle('is-background', document.hidden)
    window.addEventListener('popstate', back)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('popstate', back); document.removeEventListener('visibilitychange', visibility) }
  }, [])

  useEffect(() => localStorage.setItem('rail-favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => {
    localStorage.setItem('ferrovia-theme', theme)
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#08120f' : '#f3f5f2')
  }, [theme])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(t)
  }, [toast])
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 6000)
    return () => clearTimeout(t)
  }, [error])
  useReveal([page, loading, searchResults.length, stations.length, intro])

  const handleError = useCallback((err) => {
    if (err.status === 401) { clearSession(); setUser(null); setBookings([]); setNotifications([]) }
    setError(err.status === 401 ? 'Your session has ended. Sign in again to continue.' : err.message || 'Something went wrong. Try again.')
  }, [])
  const navigate = (p) => {
    animateUpdate(() => {
      history.pushState(null, '', `#/${p.replace(/^admin-/, 'admin/')}`)
      setPage(p)
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }
  useEffect(() => {
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [page])

  const loadStations = useCallback(async () => {
    try { setStations(await api('/stations')) } catch (err) { handleError(err) }
  }, [handleError])
  const loadBookings = useCallback(async () => {
    if (!getStoredToken()) return setBookings([])
    try {
      setBookings(await api('/bookings/mine'))
    } catch (err) {
      if (err.status === 401) {
        clearSession()
        setUser(null)
        setBookings([])
      } else handleError(err)
    }
  }, [handleError])
  const loadNotifications = useCallback(async () => {
    if (!getStoredToken()) return setNotifications([])
    try { setNotifications(await api('/notifications')) } catch (err) { if (err.status !== 401) handleError(err) }
  }, [handleError])

  useEffect(() => { loadStations() }, [loadStations])
  useEffect(() => {
    const token = getStoredToken()
    if (!token) return
    api('/auth/me')
      .then((me) => {
        setUser(me)
        localStorage.setItem('rail-user', JSON.stringify(me))
        loadBookings()
        loadNotifications()
      })
      .catch(() => {
        clearSession()
        setUser(null)
      })
  }, [loadBookings, loadNotifications])
  useEffect(() => {
    if (user) {
      loadBookings()
      loadNotifications()
    } else {
      setBookings([])
      setNotifications([])
    }
  }, [user, loadBookings, loadNotifications])

  const doSearch = async () => {
    if (search.from === search.to) {
      setToast('Departure and arrival stations must be different')
      return
    }
    setLoading(true)
    setError('')
    setSearchError('')
    navigate('search')
    try {
      const trips = await api(`/trains/search?from=${encodeURIComponent(search.from)}&to=${encodeURIComponent(search.to)}&date=${encodeURIComponent(search.date)}`)
      const enriched = await Promise.all(
        trips.map(async (t) => {
          let classes = []
          try {
            classes = await api(`/bookings/classes?tripId=${t.trip_id}&sourceStationId=${t.source_station_id}&destinationStationId=${t.destination_station_id}`)
          } catch {
            classes = []
          }
          return { ...t, classes }
        })
      )
      setSearchResults(enriched)
    } catch (err) {
      setSearchResults([])
      setSearchError(err.message || 'The search could not be completed.')
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const chooseTrain = async (t, c) => {
    setLoading(true)
    setSelectedTrain(t)
    setSelectedClass(c)
    setSeats([])
    try {
      const data = await api(`/bookings/seats?tripId=${t.trip_id}&sourceStationId=${t.source_station_id}&destinationStationId=${t.destination_station_id}&classId=${c.classId}`)
      setSeatList(data.seats || [])
      navigate('seats')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }
  const toggleSeat = (id) =>
    setSeats((s) =>
      s.includes(id)
        ? s.filter((x) => x !== id)
        : s.length < search.passengers
          ? [...s, id]
          : (setToast(`You can select only ${search.passengers} seat(s)`), s)
    )
  const continuePassengers = () => {
    if (seats.length !== search.passengers) {
      setToast(`Select ${search.passengers} seat(s) first`)
      return
    }
    setPassengers(Array.from({ length: search.passengers }, (_, i) => passengers[i] || { name: '', age: '', gender: 'MALE' }))
    navigate('passengers')
  }
  const updatePassenger = (i, key, val) => setPassengers((p) => p.map((x, j) => (j === i ? { ...x, [key]: val } : x)))
  const selectedSeatLabels = seats.map((id) => {
    const s = seatList.find((x) => Number(x.trip_seat_id) === Number(id))
    return s ? `${s.coach_code}-${s.seat_number}` : `#${id}`
  })
  const estimatedTotal = (selectedClass?.farePerPassenger || 0) * search.passengers

  const createPendingBooking = async (tokenOverride) => {
    setLoading(true)
    try {
      const data = await api('/bookings', {
        method: 'POST',
        token: tokenOverride || getStoredToken(),
        body: {
          tripId: selectedTrain.trip_id,
          sourceStationId: selectedTrain.source_station_id,
          destinationStationId: selectedTrain.destination_station_id,
          classId: selectedClass.classId,
          passengers: passengers.map((p, i) => ({ ...p, age: Number(p.age), tripSeatId: Number(seats[i]) })),
        },
      })
      setPendingBooking(data)
      navigate('payment')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }
  const toPayment = async () => {
    if (passengers.some((p) => !p.name || !p.age || Number(p.age) < 1 || Number(p.age) > 120)) {
      setToast('Complete passenger information with age 1–120')
      return
    }
    if (!user) {
      setAuthResume('payment')
      setAuthMode('signin')
      setAuthOpen(true)
      setToast('Sign in to hold your selected seats')
      return
    }
    await createPendingBooking()
  }
  const confirmPayment = async (e, method) => {
    e.preventDefault()
    if (!pendingBooking) return
    setLoading(true)
    try {
      const map = { 'Mobile Banking': 'MOBILE_BANKING', Card: 'CARD', 'Bank Transfer': 'BANK_TRANSFER' }
      const form = new FormData(e.currentTarget)
      const data = await api(`/bookings/${pendingBooking.pnr_number}/pay`, {
        method: 'POST',
        body: { method: map[method], transactionId: form.get('transactionId') || undefined },
      })
      setLastBooking(data)
      setPendingBooking(null)
      await Promise.all([loadBookings(), loadNotifications()])
      navigate('confirmation')
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }
  // The confirmation dialog (with refund policy) is shown by the Tickets page before this runs.
  const cancelBooking = async (pnr) => {
    setLoading(true)
    try {
      const result = await api(`/bookings/${pnr}/cancel`, { method: 'POST' })
      setToast(
        result.status === 'cancellation_requested'
          ? `Cancellation requested. Estimated refund: ৳${result.refundAmount}. Awaiting admin review.`
          : 'Booking cancelled.'
      )
      await Promise.all([loadBookings(), loadNotifications()])
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }
  const markAllRead = async () => {
    try {
      await api('/notifications/read-all', { method: 'PATCH' })
      await loadNotifications()
    } catch (err) {
      handleError(err)
    }
  }
  const logout = () => {
    clearSession()
    setUser(null)
    setToast('Signed out successfully')
    navigate('home')
  }
  const toggleFavorite = (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const unreadCount = notifications.filter((n) => Number(n.is_read) === 0).length

  const authSuccess = async (session) => {
    if (session.pendingApproval) {
      setAuthOpen(false)
      setAuthResume(null)
      setToast(session.message || 'Operator account is waiting for admin approval.')
      return
    }
    storeSession(session)
    setUser(session.user)
    setAuthOpen(false)
    setToast(`Welcome, ${session.user.full_name}`)
    const resume = authResume
    setAuthResume(null)
    if (resume === 'payment') await createPendingBooking(session.token)
  }
  const toggleTheme = () => animateUpdate(() => setTheme((value) => (value === 'dark' ? 'light' : 'dark')))
  const openAuth = () => setAuthOpen(true)
  const common = { user, handleError, setToast }

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home search={search} setSearch={setSearch} doSearch={doSearch} navigate={navigate} stations={stations} />
      case 'search': return <SearchPage search={search} setSearch={setSearch} doSearch={doSearch} chooseTrain={chooseTrain} favorites={favorites} toggleFavorite={toggleFavorite} setDetailTrain={setDetailTrain} loading={loading} trains={searchResults} stations={stations} searchError={searchError} />
      case 'seats': return <SeatPage train={selectedTrain} cls={selectedClass} search={search} seatList={seatList} seats={seats} seatLabels={selectedSeatLabels} toggleSeat={toggleSeat} next={continuePassengers} back={() => navigate('search')} total={estimatedTotal} />
      case 'passengers': return <PassengerPage passengers={passengers} update={updatePassenger} next={toPayment} back={() => navigate('seats')} train={selectedTrain} cls={selectedClass} search={search} seatLabels={selectedSeatLabels} total={estimatedTotal} user={user} />
      case 'payment': return <PaymentPage booking={pendingBooking} confirm={confirmPayment} back={() => navigate('passengers')} train={selectedTrain} cls={selectedClass} search={search} seatLabels={selectedSeatLabels} paying={loading} navigate={navigate} />
      case 'confirmation': return <Confirmation booking={lastBooking} navigate={navigate} />
      case 'dashboard': return <Dashboard user={user} bookings={bookings} favorites={favorites} notifications={notifications} navigate={navigate} onAuth={openAuth} />
      case 'tickets': return <Tickets user={user} bookings={bookings} navigate={navigate} cancel={cancelBooking} onAuth={openAuth} handleError={handleError} />
      case 'track': return <TrackTrain handleError={handleError} />
      case 'notifications': return <NotificationsPage user={user} notifications={notifications} reload={loadNotifications} onAuth={openAuth} handleError={handleError} />
      case 'operator': return <OperatorPanel {...common} />
      case 'admin': return <AdminOverview {...common} navigate={navigate} />
      case 'admin-add-train':
        return (
          <main className="page page-enter ws-page">
            <PageHeader crumbs={['Admin', 'Train management', 'Add train service']} title="Add a train service" description="Configure the train, its up and down routes, weekly schedule, fleet, fares and coaches in one place." />
            <AdminTrainServiceForm {...common} />
          </main>
        )
      case 'admin-edit-train': return <AdminEditTrain {...common} />
      case 'admin-assign-trip': return <AdminAssignTrip {...common} />
      case 'admin-cancellations': return <AdminCancellationRequests {...common} />
      case 'admin-operator-approvals': return <AdminOperatorApprovals {...common} />
      case 'support': return <Support setToast={setToast} />
      default: return <NotFound navigate={navigate} />
    }
  }

  const inWorkspace = WORKSPACE_PAGES.has(page) && ((user?.role === 'ADMIN' && page.startsWith('admin')) || (user?.role === 'OPERATOR' && page === 'operator'))
  const content = <Suspense fallback={<main className="page" aria-busy="true"><div className="skeleton" style={{ height: 280 }} /><p role="status">Loading workspace?</p></main>}><div id="main-content" key={page} tabIndex={-1}>{PAGES.has(page) ? renderPage() : <NotFound navigate={navigate} />}</div></Suspense>

  return (
    <ConfirmProvider>
      <div className={`app ${inWorkspace ? 'is-workspace' : ''}`}>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        {intro && <Intro onDone={() => setIntro(false)} />}
        <Navbar
          page={page}
          navigate={navigate}
          user={user}
          onAuth={openAuth}
          onLogout={logout}
          notifications={notifications}
          notificationCount={unreadCount}
          onMarkAllRead={markAllRead}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <Toasts toast={toast} error={error} onDismissToast={() => setToast('')} onDismissError={() => setError('')} />
        {loading && <div className="global-loading" role="progressbar" aria-label="Loading"><span /></div>}
        {inWorkspace ? <Workspace user={user} page={page} navigate={navigate}>{content}</Workspace> : content}
        <AiAssistant />
        {!inWorkspace && <Footer navigate={navigate} />}
        {authOpen && (
          <AuthModal
            mode={authMode}
            setMode={setAuthMode}
            close={() => { setAuthOpen(false); setAuthResume(null) }}
            onSuccess={authSuccess}
          />
        )}
        {detailTrain && (
          <TrainDetail
            train={detailTrain}
            close={() => setDetailTrain(null)}
            choose={(c) => { chooseTrain(detailTrain, c); setDetailTrain(null) }}
          />
        )}
      </div>
    </ConfirmProvider>
  )
}

export default App
