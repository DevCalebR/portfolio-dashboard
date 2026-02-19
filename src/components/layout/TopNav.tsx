import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/format'

export function TopNav() {
  return (
    <header className="top-nav">
      <div>
        <p className="top-nav__label">Workspace</p>
        <h1 className="top-nav__title">Portfolio Dashboard</h1>
      </div>
      <div className="top-nav__actions">
        <span className="top-nav__date">{formatDate(new Date())}</span>
        <Link className="ui-button ui-button--primary" to="/runs/new">
          New Run
        </Link>
      </div>
    </header>
  )
}
