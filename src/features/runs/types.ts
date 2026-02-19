export type RunStatus = 'completed' | 'failed' | 'queued' | 'running'

export interface Run {
  createdAt: string
  endDate: string
  id: string
  maxDD: number
  pair: string
  pf: number
  startDate: string
  status: RunStatus
  timeframe: string
  trades: number
}
