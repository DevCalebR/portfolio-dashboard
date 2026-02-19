import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getRunById } from '../features/runs/mockApi'
import type { Run, RunStatus } from '../features/runs/types'
import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatNumber,
  formatPercent,
} from '../lib/format'

type DetailState = 'error' | 'loading' | 'not-found' | 'success'

interface EquityPoint {
  drawdown: number
  equity: number
  step: number
}

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

function hashString(input: string): number {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function pseudoRandom(seed: number): number {
  const sample = Math.sin(seed) * 10000

  return sample - Math.floor(sample)
}

function buildEquitySeries(run: Run): EquityPoint[] {
  const points = Math.max(24, Math.min(72, Math.round(run.trades / 2)))
  const baseSeed = hashString(`${run.id}:${run.pair}:${run.strategy}`)
  const baselineEquity = 10000
  const drift = (run.pf - 1) / points
  const volatility = Math.max(0.003, run.maxDD / 7)

  let equity = baselineEquity
  let peak = baselineEquity

  return Array.from({ length: points }, (_, index) => {
    const step = index + 1
    const noise = pseudoRandom(baseSeed + step * 17) - 0.5
    const move = drift + noise * volatility

    equity = Math.max(6000, equity * (1 + move))
    peak = Math.max(peak, equity)

    return {
      drawdown: Number.parseFloat((((equity - peak) / peak) * 100).toFixed(2)),
      equity: Number.parseFloat(equity.toFixed(2)),
      step,
    }
  })
}

function formatTooltipNumber(
  value: number | string | readonly (number | string)[] | undefined,
): string {
  const normalizedValue = Array.isArray(value) ? value[0] : value

  if (normalizedValue === undefined) {
    return '0.0'
  }

  return formatNumber(
    typeof normalizedValue === 'number'
      ? normalizedValue
      : Number(normalizedValue),
    2,
  )
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
    void loadRun()
  }, [loadRun])

  const equitySeries = useMemo(() => {
    if (!run) {
      return []
    }

    return buildEquitySeries(run)
  }, [run])

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
            <Button onClick={() => void loadRun()} variant="secondary">
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

          <section className="card-grid card-grid--two">
            <Card subtitle="Synthetic path derived from PF, trades, and drawdown" title="Equity Curve">
              <div className="chart-panel">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={equitySeries} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid stroke="#e6edf5" strokeDasharray="3 3" />
                    <XAxis dataKey="step" tickLine={false} />
                    <YAxis
                      tickFormatter={(value) => formatNumber(Number(value), 0)}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value), 2)}
                      labelFormatter={(value) => `Point ${value}`}
                    />
                    <Line
                      dataKey="equity"
                      dot={false}
                      stroke="#176d65"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card subtitle="Percent from peak equity" title="Drawdown">
              <div className="chart-panel">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={equitySeries} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid stroke="#f0e2e5" strokeDasharray="3 3" />
                    <XAxis dataKey="step" tickLine={false} />
                    <YAxis
                      tickFormatter={(value) => `${formatTooltipNumber(value)}%`}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => `${formatTooltipNumber(value)}%`}
                      labelFormatter={(value) => `Point ${value}`}
                    />
                    <Area
                      dataKey="drawdown"
                      fill="rgba(161, 41, 55, 0.24)"
                      stroke="#a12937"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  )
}
