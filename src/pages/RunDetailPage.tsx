import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getRunById } from '../features/runs/mockApi'
import type { Run, RunStatus } from '../features/runs/types'
import { formatDate, formatDateRange, formatNumber, formatPercent } from '../lib/format'

const RunDetailCharts = lazy(() =>
  import('../features/runs/components/RunDetailCharts').then((module) => ({
    default: module.RunDetailCharts,
  })),
)

type DetailState = 'error' | 'loading' | 'not-found' | 'success'

function statusBadgeVariant(
  status: RunStatus,
): 'danger' | 'neutral' | 'success' | 'warning' {
  if (status === 'done') {
    return 'success'
  }

  if (status === 'failed') {
    return 'danger'
  }

  if (status === 'running') {
    return 'warning'
  }

  return 'neutral'
}

export function RunDetailPage() {
  const { id } = useParams()
  const [detailState, setDetailState] = useState<DetailState>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [run, setRun] = useState<Run | null>(null)

  const loadRun = useCallback(async () => {
    if (!id) {
      setRun(null)
      setDetailState('not-found')
      return
    }

    setDetailState('loading')
    setErrorMessage('')

    try {
      const result = await getRunById(id)

      if (!result) {
        setRun(null)
        setDetailState('not-found')
        return
      }

      setRun(result)
      setDetailState('success')
    } catch (error) {
      setRun(null)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unexpected error while loading run detail.',
      )
      setDetailState('error')
    }
  }, [id])

  useEffect(() => {
    // This loader intentionally sets local loading/error state before awaiting the mock API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRun()
  }, [loadRun])

  return (
    <div className="page">
      <header className="page-header page-header--with-action">
        <div>
          <p className="page-eyebrow">Run Details</p>
          <h2 className="page-title">Run {id ?? 'Unknown'}</h2>
          <p className="page-subtitle">
            Metrics and charts are generated from mock run data.
          </p>
        </div>
        <Link className="ui-button ui-button--ghost" to="/runs">
          Back to Runs
        </Link>
      </header>

      {detailState === 'loading' ? (
        <Card className="state-card" title="Loading run detail">
          <p className="state-text">Reading run from mock API...</p>
        </Card>
      ) : null}

      {detailState === 'error' ? (
        <Card className="state-card" title="Unable to load run detail">
          <p className="state-text">{errorMessage}</p>
          <div className="state-card__actions">
            <Button
              aria-label="Retry loading run detail"
              onClick={() => void loadRun()}
              variant="secondary"
            >
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      {detailState === 'not-found' ? (
        <Card className="state-card" title="Run not found">
          <p className="state-text">
            The requested run does not exist or was removed.
          </p>
          <div className="state-card__actions">
            <Link className="ui-button ui-button--secondary" to="/runs">
              Back to Runs
            </Link>
          </div>
        </Card>
      ) : null}

      {detailState === 'success' && run ? (
        <>
          <section className="card-grid card-grid--three run-metrics-grid">
            <Card title="Profit Factor">
              <p className="metric-value">{formatNumber(run.pf, 2)}</p>
            </Card>

            <Card title="Trades">
              <p className="metric-value">{formatNumber(run.trades, 0)}</p>
            </Card>

            <Card title="Max Drawdown">
              <p className="metric-value">{formatPercent(run.maxDD)}</p>
            </Card>

            <Card title="Date Range">
              <p className="metric-text">
                {formatDateRange(run.startDate, run.endDate)}
              </p>
            </Card>

            <Card title="Status">
              <Badge variant={statusBadgeVariant(run.status)}>{run.status}</Badge>
              <p className="metric-subtext">Created {formatDate(run.createdAt)}</p>
            </Card>

            <Card title="Risk / Strategy">
              <p className="metric-text">
                {formatNumber(run.riskPct, 2)}% / {run.strategy}
              </p>
            </Card>
          </section>

          <Suspense
            fallback={
              <Card className="state-card" title="Loading chart module">
                <p className="state-text">Fetching chart components...</p>
              </Card>
            }
          >
            <RunDetailCharts run={run} />
          </Suspense>
        </>
      ) : null}
    </div>
  )
}
