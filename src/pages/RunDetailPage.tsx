import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getRunById } from '../features/runs/mockApi'
import type { Run } from '../features/runs/types'
import { formatDate, formatNumber, formatPercent } from '../lib/format'

type DetailState = 'error' | 'loading' | 'not-found' | 'success'

export function RunDetailPage() {
  const { id } = useParams()
  const [detailState, setDetailState] = useState<DetailState>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [run, setRun] = useState<Run | null>(null)

  const loadRun = useCallback(async () => {
    if (!id) {
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
          : 'Unexpected error while loading run details.',
      )
      setDetailState('error')
    }
  }, [id])

  useEffect(() => {
    void loadRun()
  }, [loadRun])

  return (
    <div className="page">
      <header className="page-header page-header--with-action">
        <div>
          <p className="page-eyebrow">Run Details</p>
          <h2 className="page-title">Run {id ?? 'Unknown'}</h2>
          <p className="page-subtitle">
            Loading, error, and missing-record states are wired for this page.
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
            <Button onClick={() => void loadRun()} variant="secondary">
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      {detailState === 'not-found' ? (
        <Card className="state-card" title="Run not found">
          <p className="state-text">
            Empty state: this run ID does not exist in the mock dataset.
          </p>
        </Card>
      ) : null}

      {detailState === 'success' && run ? (
        <Card
          actions={<Badge variant="success">{run.status}</Badge>}
          subtitle={`Created ${formatDate(run.createdAt)}`}
          title={run.id}
        >
          <dl className="details-grid">
            <div>
              <dt>Pair</dt>
              <dd>{run.pair}</dd>
            </div>
            <div>
              <dt>Timeframe</dt>
              <dd>{run.timeframe}</dd>
            </div>
            <div>
              <dt>Start Date</dt>
              <dd>{formatDate(run.startDate)}</dd>
            </div>
            <div>
              <dt>End Date</dt>
              <dd>{formatDate(run.endDate)}</dd>
            </div>
            <div>
              <dt>Profit Factor</dt>
              <dd>{formatNumber(run.pf, 2)}</dd>
            </div>
            <div>
              <dt>Trades</dt>
              <dd>{formatNumber(run.trades, 0)}</dd>
            </div>
            <div>
              <dt>Max Drawdown</dt>
              <dd>{formatPercent(run.maxDD)}</dd>
            </div>
          </dl>
        </Card>
      ) : null}
    </div>
  )
}
