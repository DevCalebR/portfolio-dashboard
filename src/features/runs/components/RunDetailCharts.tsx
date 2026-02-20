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
import { Card } from '../../../components/ui/Card'
import type { Run } from '../types'
import { formatCurrency, formatNumber } from '../../../lib/format'

interface EquityPoint {
  drawdown: number
  equity: number
  step: number
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

export function RunDetailCharts({ run }: { run: Run }) {
  const equitySeries = buildEquitySeries(run)

  return (
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
  )
}
