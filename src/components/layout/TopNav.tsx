import { Link } from 'react-router-dom'
import { appConfig } from '../../config/appConfig'
import { formatDate } from '../../lib/format'

export function TopNav() {
  return (
    <header className="top-nav">
      <div>
        <p className="top-nav__label">{appConfig.navLabel}</p>
        <h1 className="top-nav__title">{appConfig.name}</h1>
      </div>
      <div className="top-nav__actions">
        <span className="top-nav__date">{formatDate(new Date())}</span>
        <Link className="ui-button ui-button--primary" to="/runs/new">
          {appConfig.primaryActionLabel}
        </Link>
      </div>
    </header>
  )
}
