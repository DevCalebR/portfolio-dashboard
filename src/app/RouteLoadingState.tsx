import { Card } from '../components/ui/Card'

export function RouteLoadingState() {
  return (
    <div className="page page--loading" role="status" aria-live="polite">
      <Card className="state-card" title="Loading page">
        <p className="state-text">Preparing route chunk...</p>
      </Card>
    </div>
  )
}
