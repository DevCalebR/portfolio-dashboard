import { Link, useLocation } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">404</p>
          <h2 className="page-title">Page Not Found</h2>
          <p className="page-subtitle">
            No route matched <code>{location.pathname}</code>.
          </p>
        </div>
      </header>

      <Card className="state-card" title="Route not available">
        <p className="state-text">
          This dashboard skeleton includes a catch-all route for unknown paths.
        </p>
        <div className="state-card__actions">
          <Link className="ui-button ui-button--secondary" to="/dashboard">
            Go to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  )
}
