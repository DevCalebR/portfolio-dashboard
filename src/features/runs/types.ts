export const runStatuses = ['done', 'failed', 'queued', 'running'] as const

export type RunStatus = (typeof runStatuses)[number]

export const runStrategies = ['momentum', 'mean_reversion', 'breakout'] as const

export type RunStrategy = (typeof runStrategies)[number]

export type RunSortBy = 'createdAt' | 'maxDD' | 'pf' | 'trades'

export type RunSortDir = 'asc' | 'desc'

export interface Run {
  createdAt: string
  endDate: string
  id: string
  maxDD: number
  pair: string
  pf: number
  riskPct: number
  startDate: string
  status: RunStatus
  strategy: RunStrategy
  timeframe: string
  trades: number
}

export interface ListRunsParams {
  forceError?: boolean
  page?: number
  pageSize?: number
  query?: string
  sortBy?: RunSortBy
  sortDir?: RunSortDir
  status?: RunStatus | 'all'
}

export interface ListRunsResult {
  items: Run[]
  page: number
  pageSize: number
  total: number
}

export interface CreateRunInput {
  endDate: string
  forceError?: boolean
  pair: string
  riskPct: number
  startDate: string
  strategy: RunStrategy
  timeframe: 'D1' | 'H1' | 'H4' | 'M15'
}
