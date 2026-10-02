import { Button } from '../components/ui/Button'

export default function NotFound({ navigate }) {
  return (
    <main className="page page-enter not-found">
      <svg className="not-found-art" viewBox="0 0 520 160" aria-hidden="true">
        <path className="nf-rail" d="M20 110H200C240 110 250 60 300 60H360" />
        <path className="nf-rail is-dashed" d="M372 60H500" />
        <circle className="nf-node" cx="20" cy="110" r="9" />
        <circle className="nf-node" cx="200" cy="110" r="9" />
        <circle className="nf-node is-lost" cx="500" cy="60" r="11" />
        <path className="nf-buffer" d="M362 42v36M370 42v36" />
      </svg>
      <span className="page-overline">Error 404</span>
      <h1>This line doesn’t go anywhere.</h1>
      <p>The page you were heading to has no station. Head back to a route that does.</p>
      <div className="btn-group">
        <Button icon="home" onClick={() => navigate('home')}>Back to home</Button>
        <Button variant="secondary" icon="search" onClick={() => navigate('search')}>Find trains</Button>
      </div>
    </main>
  )
}
