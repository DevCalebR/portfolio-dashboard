import { mockRuns } from './mockData'
import type {
  CreateRunInput,
  ListRunsParams,
  ListRunsResult,
  Run,
  RunSortBy,
  RunSortDir,
} from './types'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT_BY: RunSortBy = 'createdAt'
const DEFAULT_SORT_DIR: RunSortDir = 'desc'
const MAX_DELAY_MS = 400
const MIN_DELAY_MS = 200
const RANDOM_ERROR_RATE = 0.01

let runStore: Run[] = [...mockRuns]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function parsePage(value: number | undefined): number {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_PAGE
  }

  return Math.max(DEFAULT_PAGE, Math.floor(value))
}

function parsePageSize(value: number | undefined): number {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.max(1, Math.floor(value))
}

function isValidSortBy(value: string | undefined): value is RunSortBy {
  return value === 'createdAt' || value === 'maxDD' || value === 'pf' || value === 'trades'
}

function isValidSortDir(value: string | undefined): value is RunSortDir {
  return value === 'asc' || value === 'desc'
}

function sortRuns(runs: Run[], sortBy: RunSortBy, sortDir: RunSortDir): Run[] {
  const multiplier = sortDir === 'asc' ? 1 : -1

  return [...runs].sort((left, right) => {
    let leftValue = 0
    let rightValue = 0

    if (sortBy === 'createdAt') {
      leftValue = new Date(left.createdAt).getTime()
      rightValue = new Date(right.createdAt).getTime()
    }

    if (sortBy === 'maxDD') {
      leftValue = left.maxDD
      rightValue = right.maxDD
    }

    if (sortBy === 'pf') {
      leftValue = left.pf
      rightValue = right.pf
    }

    if (sortBy === 'trades') {
      leftValue = left.trades
      rightValue = right.trades
    }

    if (leftValue === rightValue) {
      return 0
    }

    return leftValue > rightValue ? multiplier : -multiplier
  })
}

function shouldFailRequest(forceError?: boolean, allowRandomError = true): boolean {
  if (forceError === true) {
    return true
  }

  if (forceError === false) {
    return false
  }

  if (!allowRandomError) {
    return false
  }

  return Math.random() < RANDOM_ERROR_RATE
}

async function simulateLatency(): Promise<void> {
  await sleep(randomInt(MIN_DELAY_MS, MAX_DELAY_MS))
}

function nextRunId(): string {
  const nextNumber =
    runStore.reduce((maxValue, run) => {
      const numericPart = Number.parseInt(run.id.replace(/\D/g, ''), 10)

      if (Number.isNaN(numericPart)) {
        return maxValue
      }

      return Math.max(maxValue, numericPart)
    }, 100) + 1

  return `RUN-${String(nextNumber).padStart(3, '0')}`
}

function hashString(input: string): number {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function buildMetrics(input: CreateRunInput): Pick<Run, 'maxDD' | 'pf' | 'trades'> {
  const seed = hashString(
    `${input.pair}:${input.timeframe}:${input.startDate}:${input.endDate}:${input.strategy}:${input.riskPct}`,
  )

  const baselinePf = 0.95 + (seed % 95) / 100
  const pf = Number.parseFloat(Math.min(Math.max(baselinePf, 0.65), 2.2).toFixed(2))

  const timeframeMultiplier: Record<CreateRunInput['timeframe'], number> = {
    D1: 1,
    H1: 2.5,
    H4: 1.5,
    M15: 4,
  }

  const trades = Math.max(
    8,
    Math.round(((seed % 70) + 12) * timeframeMultiplier[input.timeframe]),
  )

  const baseDrawdown = 0.03 + (seed % 11) / 100
  const riskFactor = input.riskPct / 100
  const maxDD = Number.parseFloat(
    Math.min(baseDrawdown + riskFactor * 8, 0.35).toFixed(3),
  )

  return {
    maxDD,
    pf,
    trades,
  }
}

export async function listRuns(params: ListRunsParams = {}): Promise<ListRunsResult> {
  await simulateLatency()

  if (shouldFailRequest(params.forceError, true)) {
    throw new Error('Unable to load runs from mock service. Please retry.')
  }

  const query = normalize(params.query ?? '')
  const sortBy = isValidSortBy(params.sortBy) ? params.sortBy : DEFAULT_SORT_BY
  const sortDir = isValidSortDir(params.sortDir) ? params.sortDir : DEFAULT_SORT_DIR
  const requestedPage = parsePage(params.page)
  const requestedPageSize = parsePageSize(params.pageSize)

  const filteredRuns = runStore.filter((run) => {
    const matchesQuery =
      query.length === 0 ||
      normalize(run.pair).includes(query) ||
      normalize(run.timeframe).includes(query) ||
      normalize(run.status).includes(query)

    const matchesStatus =
      !params.status || params.status === 'all' || run.status === params.status

    return matchesQuery && matchesStatus
  })

  const sortedRuns = sortRuns(filteredRuns, sortBy, sortDir)
  const total = sortedRuns.length
  const totalPages = Math.max(1, Math.ceil(total / requestedPageSize))
  const page = clamp(requestedPage, 1, totalPages)
  const startIndex = (page - 1) * requestedPageSize

  return {
    items: sortedRuns.slice(startIndex, startIndex + requestedPageSize),
    page,
    pageSize: requestedPageSize,
    total,
  }
}

export async function getRunById(
  id: string,
  options: { forceError?: boolean } = {},
): Promise<Run | null> {
  await simulateLatency()

  if (shouldFailRequest(options.forceError, true)) {
    throw new Error('Unable to load run details from mock service. Please retry.')
  }

  return runStore.find((run) => run.id === id) ?? null
}

export async function createRun(input: CreateRunInput): Promise<Run> {
  await simulateLatency()

  if (shouldFailRequest(input.forceError, false)) {
    throw new Error('Unable to create run in mock service. Please retry.')
  }

  const { maxDD, pf, trades } = buildMetrics(input)

  const createdRun: Run = {
    createdAt: new Date().toISOString(),
    endDate: input.endDate,
    id: nextRunId(),
    maxDD,
    pair: input.pair,
    pf,
    riskPct: input.riskPct,
    startDate: input.startDate,
    status: 'queued',
    strategy: input.strategy,
    timeframe: input.timeframe,
    trades,
  }

  runStore = [createdRun, ...runStore]

  return createdRun
}
