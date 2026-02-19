import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { listRuns } from '../features/runs/mockApi'
import type { Run, RunStatus } from '../features/runs/types'
import { formatDate, formatNumber, formatPercent } from '../lib/format'

type LoadState = 'error' | 'loading' | 'success'

const statusVariant: Record<RunStatus, 'danger' | 'neutral' | 'success' | 'warning'> =
  {
    completed: 'success',
    failed: 'danger',
    queued: 'neutral',
    running: 'warning',
  }

export function RunsPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [runs, setRuns] = useState<Run[]>([])

  const loadRuns = useCallback(async () => {
    setLoadState('loading')
    setErrorMessage('')

    try {
      const result = await listRuns()
      setRuns(result)
      setLoadState('success')
    } catch (error) {
      setRuns([])
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unexpected error while loading runs.',
      )
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    void loadRuns()
  }, [loadRuns])

  return (
    <div className="page">
      <header className="page-header page-header--with-action">
        <div>
          <p className="page-eyebrow">Backtests</p>
          <h2 className="page-title">Runs</h2>
          <p className="page-subtitle">
            Data is loaded from `features/runs/mockApi.ts` for Step 1 plumbing.
          </p>
        </div>
        <Link className="ui-button ui-button--secondary" to="/runs/new">
          Create New Run
        </Link>
      </header>

      {loadState === 'loading' ? (
        <Card className="state-card" title="Loading runs">
          <p className="state-text">Fetching run history from mock API...</p>
        </Card>
      ) : null}

      {loadState === 'error' ? (
        <Card className="state-card" title="Error loading runs">
          <p className="state-text">{errorMessage}</p>
          <div className="state-card__actions">
            <Button onClick={() => void loadRuns()} variant="secondary">
              Retry
            </Button>
          </div>
        </Card>
      ) : null}

      {loadState === 'success' && runs.length === 0 ? (
        <Card className="state-card" title="No runs yet">
          <p className="state-text">
            Empty state: once runs are created, they will appear here.
          </p>
        </Card>
      ) : null}

      {loadState === 'success' && runs.length > 0 ? (
        <Card subtitle="Simple table placeholder; TanStack table setup in Step 2" title="Run List">
          <div className="table-wrap">
            <table className="runs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pair</th>
                  <th>Timeframe</th>
                  <th>Date Range</th>
                  <th>PF</th>
                  <th>Trades</th>
                  <th>Max DD</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td>
                      <Link className="runs-table__link" to={`/runs/${run.id}`}>
                        {run.id}
                      </Link>
                    </td>
                    <td>{run.pair}</td>
                    <td>{run.timeframe}</td>
                    <td>
                      {formatDate(run.startDate)} - {formatDate(run.endDate)}
                    </td>
                    <td>{formatNumber(run.pf, 2)}</td>
                    <td>{formatNumber(run.trades, 0)}</td>
                    <td>{formatPercent(run.maxDD)}</td>
                    <td>
                      <Badge variant={statusVariant[run.status]}>{run.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
