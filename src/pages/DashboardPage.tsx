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
            Portfolio-level placeholders for KPI, risk, and deployment health.
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
          actions={<Badge variant="warning">Placeholder</Badge>}
          subtitle="No analytics pipeline is connected yet."
          title="Performance Curve"
        >
          <p className="state-text">
            Empty state: aggregate equity curve and drawdown overlays will appear
            here.
          </p>
        </Card>

        <Card
          actions={<Badge variant="danger">Placeholder</Badge>}
          subtitle="No risk anomalies detected in this mock view."
          title="Risk Feed"
        >
          <p className="state-text">
            Error state example: data service unavailable. Retry controls can be
            added in Step 2.
          </p>
        </Card>
      </section>
    </div>
  )
}
