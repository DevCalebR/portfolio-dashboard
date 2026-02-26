import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Card } from '../components/ui/Card'

function getErrorCopy(error: unknown): { title: string; message: string } {
  if (isRouteErrorResponse(error)) {
    return {
      message:
        error.statusText || 'The requested route could not be rendered.',
      title: `Route Error (${error.status})`,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Unexpected application error.',
      title: 'Unexpected Application Error',
    }
  }

  return {
    message: 'Something went wrong while rendering this view.',
    title: 'Unexpected Application Error',
  }
}

export function RouteErrorPage() {
  const error = useRouteError()
  const { message, title } = getErrorCopy(error)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Error</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">
            A route-level fallback caught an unexpected issue.
          </p>
        </div>
      </header>

      <Card className="state-card" title="Unable to render page">
        <p className="state-text" role="alert">
          {message}
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
