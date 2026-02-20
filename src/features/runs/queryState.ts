import type { RunSortBy, RunSortDir, RunStatus } from './types'

export type RunsStatusFilter = RunStatus | 'all'

export interface RunsQueryState {
  page: number
  pageSize: number
  query: string
  sortBy: RunSortBy
  sortDir: RunSortDir
  status: RunsStatusFilter
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_SORT_BY: RunSortBy = 'createdAt'
export const DEFAULT_SORT_DIR: RunSortDir = 'desc'
export const DEFAULT_STATUS: RunsStatusFilter = 'all'
export const DEFAULT_SORT_TOKEN = `${DEFAULT_SORT_BY}:${DEFAULT_SORT_DIR}`
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

function isRunStatus(value: string | null): value is RunStatus {
  return (
    value === 'done' ||
    value === 'failed' ||
    value === 'queued' ||
    value === 'running'
  )
}

function isRunSortBy(value: string | null): value is RunSortBy {
  return (
    value === 'createdAt' ||
    value === 'maxDD' ||
    value === 'pf' ||
    value === 'trades'
  )
}

export function isRunSortByValue(value: string | null): value is RunSortBy {
  return isRunSortBy(value)
}

function isRunSortDir(value: string | null): value is RunSortDir {
  return value === 'asc' || value === 'desc'
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback
  }

  return parsed
}

function parseSortToken(token: string | null): {
  sortBy: RunSortBy
  sortDir: RunSortDir
} {
  if (!token) {
    return {
      sortBy: DEFAULT_SORT_BY,
      sortDir: DEFAULT_SORT_DIR,
    }
  }

  const [sortByToken, sortDirToken] = token.split(':')

  if (!isRunSortBy(sortByToken) || !isRunSortDir(sortDirToken)) {
    return {
      sortBy: DEFAULT_SORT_BY,
      sortDir: DEFAULT_SORT_DIR,
    }
  }

  return {
    sortBy: sortByToken,
    sortDir: sortDirToken,
  }
}

export function parseRunsQueryState(
  searchParams: URLSearchParams,
): RunsQueryState {
  const parsedStatus = searchParams.get('status')
  const parsedSort = parseSortToken(searchParams.get('sort'))
  const parsedPageSize = parsePositiveInt(
    searchParams.get('pageSize'),
    DEFAULT_PAGE_SIZE,
  )

  return {
    page: parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE),
    pageSize: PAGE_SIZE_OPTIONS.includes(parsedPageSize as 10 | 20 | 50)
      ? parsedPageSize
      : DEFAULT_PAGE_SIZE,
    query: searchParams.get('query') ?? '',
    sortBy: parsedSort.sortBy,
    sortDir: parsedSort.sortDir,
    status: isRunStatus(parsedStatus) ? parsedStatus : DEFAULT_STATUS,
  }
}

export function createRunsSearchParams(
  state: RunsQueryState,
): URLSearchParams {
  const next = new URLSearchParams()
  const trimmedQuery = state.query.trim()
  const sortToken = `${state.sortBy}:${state.sortDir}`

  if (trimmedQuery) {
    next.set('query', trimmedQuery)
  }

  if (state.status !== DEFAULT_STATUS) {
    next.set('status', state.status)
  }

  if (sortToken !== DEFAULT_SORT_TOKEN) {
    next.set('sort', sortToken)
  }

  if (state.page !== DEFAULT_PAGE) {
    next.set('page', String(state.page))
  }

  if (state.pageSize !== DEFAULT_PAGE_SIZE) {
    next.set('pageSize', String(state.pageSize))
  }

  return next
}
