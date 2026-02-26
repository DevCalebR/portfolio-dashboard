import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

const metricCards = [
  { label: 'Active Models', value: '4', context: '2 running, 2 queued' },
  { label: 'Open Capital', value: '$125k', context: 'Across 3 brokers' },
  { label: 'Last Refresh', value: '2 min ago', context: 'Mock snapshot' },
]

export function DashboardPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Overview</p>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Portfolio-level preview of KPI, risk, and deployment health panels.
          </p>
        </div>
      </header>

      <section className="card-grid card-grid--three">
        {metricCards.map((card) => (
          <Card key={card.label} subtitle={card.context} title={card.label}>
            <p className="metric-value">{card.value}</p>
          </Card>
        ))}
      </section>

      <section className="card-grid card-grid--two">
        <Card
          actions={<Badge variant="success">About</Badge>}
          subtitle="This demo layout highlights the core workflows shipped in the app."
          title="What This App Demonstrates"
        >
          <ul className="dashboard-about-list">
            <li>Runs table with URL-synced state for search, filter, sort, and page.</li>
            <li>Validated run creation form with reusable presets and safe defaults.</li>
            <li>Run detail metrics plus lazily loaded chart modules.</li>
          </ul>
        </Card>

        <Card
          actions={<Badge variant="warning">Preview</Badge>}
          subtitle="No analytics pipeline is connected yet."
          title="Performance Curve"
        >
          <p className="state-text">
            This panel is intentionally kept as an empty-state preview for future
            aggregate equity and drawdown overlays.
          </p>
        </Card>

        <Card
          actions={<Badge variant="danger">Preview</Badge>}
          subtitle="No risk anomalies detected in this mock view."
          title="Risk Feed"
        >
          <p className="state-text">
            This panel demonstrates an error-state treatment for a future risk
            service. Add retry controls when a real feed is connected.
          </p>
        </Card>
      </section>
    </div>
  )
}
