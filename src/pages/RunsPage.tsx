import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { listRuns } from '../features/runs/mockApi'
import type {
  ListRunsResult,
  Run,
  RunSortBy,
  RunSortDir,
  RunStatus,
} from '../features/runs/types'
import { formatDate, formatNumber, formatPercent } from '../lib/format'

type LoadState = 'error' | 'loading' | 'success'
type StatusFilter = RunStatus | 'all'

interface TableQueryState {
  page: number
  pageSize: number
  query: string
  sortBy: RunSortBy
  sortDir: RunSortDir
  status: StatusFilter
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT_BY: RunSortBy = 'createdAt'
const DEFAULT_SORT_DIR: RunSortDir = 'desc'
const DEFAULT_STATUS: StatusFilter = 'all'
const DEFAULT_SORT_TOKEN = `${DEFAULT_SORT_BY}:${DEFAULT_SORT_DIR}`
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

function isRunStatus(value: string | null): value is RunStatus {
  return (
    value === 'done' ||
    value === 'failed' ||
    value === 'queued' ||
    value === 'running'
  )
}

function isRunSortBy(value: string | null): value is RunSortBy {
  return value === 'createdAt' || value === 'maxDD' || value === 'pf' || value === 'trades'
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

function parseTableQueryState(searchParams: URLSearchParams): TableQueryState {
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

function createSearchParamsFromState(state: TableQueryState): URLSearchParams {
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

function SortableHeader({
  column,
  label,
}: {
  column: Column<Run, unknown>
  label: string
}) {
  const sorting = column.getIsSorted()

  return (
    <button
      className="runs-table__sort-button"
      onClick={column.getToggleSortingHandler()}
      type="button"
    >
      <span>{label}</span>
      <span className="runs-table__sort-indicator" aria-hidden="true">
        {sorting === 'asc' ? 'ASC' : sorting === 'desc' ? 'DESC' : 'SORT'}
      </span>
    </button>
  )
}

const columns: ColumnDef<Run>[] = [
  {
    accessorKey: 'pair',
    cell: ({ row }) => <span className="runs-table__pair">{row.original.pair}</span>,
    header: 'Pair',
  },
  {
    accessorKey: 'timeframe',
    header: 'Timeframe',
  },
  {
    accessorKey: 'startDate',
    cell: ({ row }) => formatDate(row.original.startDate),
    header: 'Start',
  },
  {
    accessorKey: 'endDate',
    cell: ({ row }) => formatDate(row.original.endDate),
    header: 'End',
  },
  {
    accessorKey: 'pf',
    cell: ({ row }) => formatNumber(row.original.pf, 2),
    header: ({ column }) => <SortableHeader column={column} label="PF" />,
  },
  {
    accessorKey: 'trades',
    cell: ({ row }) => formatNumber(row.original.trades, 0),
    header: ({ column }) => <SortableHeader column={column} label="Trades" />,
  },
  {
    accessorKey: 'maxDD',
    cell: ({ row }) => formatPercent(row.original.maxDD),
    header: ({ column }) => <SortableHeader column={column} label="Max DD" />,
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge variant={statusBadgeVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
    header: 'Status',
  },
  {
    accessorKey: 'createdAt',
    cell: ({ row }) => formatDate(row.original.createdAt),
    header: ({ column }) => <SortableHeader column={column} label="Created" />,
  },
]

export function RunsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const tableQueryState = useMemo(
    () => parseTableQueryState(searchParams),
    [searchParams],
  )

  const [errorMessage, setErrorMessage] = useState('')
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [refreshTick, setRefreshTick] = useState(0)
  const [result, setResult] = useState<ListRunsResult>({
    items: [],
    page: tableQueryState.page,
    pageSize: tableQueryState.pageSize,
    total: 0,
  })

  const setTableQueryState = useCallback(
    (nextState: TableQueryState, replace = false) => {
      setSearchParams(createSearchParamsFromState(nextState), { replace })
    },
    [setSearchParams],
  )

  useEffect(() => {
    let isCancelled = false

    setLoadState('loading')
    setErrorMessage('')

    void listRuns({
      page: tableQueryState.page,
      pageSize: tableQueryState.pageSize,
      query: tableQueryState.query,
      sortBy: tableQueryState.sortBy,
      sortDir: tableQueryState.sortDir,
      status:
        tableQueryState.status === 'all' ? undefined : tableQueryState.status,
    })
      .then((response) => {
        if (isCancelled) {
          return
        }

        setResult(response)
        setLoadState('success')

        if (
          response.page !== tableQueryState.page ||
          response.pageSize !== tableQueryState.pageSize
        ) {
          setTableQueryState(
            {
              ...tableQueryState,
              page: response.page,
              pageSize: response.pageSize,
            },
            true,
          )
        }
      })
      .catch((error) => {
        if (isCancelled) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unexpected error while loading runs.',
        )
        setLoadState('error')
      })

    return () => {
      isCancelled = true
    }
  }, [refreshTick, setTableQueryState, tableQueryState])

  const sortingState: SortingState = useMemo(
    () => [
      {
        desc: tableQueryState.sortDir === 'desc',
        id: tableQueryState.sortBy,
      },
    ],
    [tableQueryState.sortBy, tableQueryState.sortDir],
  )

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const nextSorting = functionalUpdate(updater, sortingState)
      const firstSort = nextSorting[0]

      if (!firstSort || !isRunSortBy(firstSort.id)) {
        setTableQueryState({
          ...tableQueryState,
          page: DEFAULT_PAGE,
          sortBy: DEFAULT_SORT_BY,
          sortDir: DEFAULT_SORT_DIR,
        })
        return
      }

      setTableQueryState({
        ...tableQueryState,
        page: DEFAULT_PAGE,
        sortBy: firstSort.id,
        sortDir: firstSort.desc ? 'desc' : 'asc',
      })
    },
    [setTableQueryState, sortingState, tableQueryState],
  )

  const table = useReactTable({
    columns,
    data: result.items,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: handleSortingChange,
    pageCount: Math.max(1, Math.ceil(result.total / result.pageSize)),
    state: {
      sorting: sortingState,
    },
  })

  const isInitialLoading = loadState === 'loading' && result.items.length === 0
  const isRefreshing = loadState === 'loading' && result.items.length > 0
  const isEmptyResult = loadState === 'success' && result.items.length === 0
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))

  return (
    <div className="page">
      <header className="page-header page-header--with-action">
        <div>
          <p className="page-eyebrow">Backtests</p>
          <h2 className="page-title">Runs</h2>
          <p className="page-subtitle">
            Interactive table powered by TanStack Table with URL-synced state.
          </p>
        </div>
        <Link className="ui-button ui-button--secondary" to="/runs/new">
          Create New Run
        </Link>
      </header>

      <Card subtitle="Search, filter, sort, and paginate run history" title="Controls">
        <div className="runs-controls">
          <div className="runs-controls__field">
            <Input
              label="Global Search"
              onChange={(event) => {
                setTableQueryState({
                  ...tableQueryState,
                  page: DEFAULT_PAGE,
                  query: event.currentTarget.value,
                })
              }}
              placeholder="Search pair, timeframe, or status"
              value={tableQueryState.query}
            />
          </div>

          <div className="runs-controls__field">
            <Select
              label="Status"
              onChange={(event) => {
                const selectedStatus = event.currentTarget.value
                setTableQueryState({
                  ...tableQueryState,
                  page: DEFAULT_PAGE,
                  status: isRunStatus(selectedStatus)
                    ? selectedStatus
                    : DEFAULT_STATUS,
                })
              }}
              value={tableQueryState.status}
            >
              <option value="all">All</option>
              <option value="done">done</option>
              <option value="queued">queued</option>
              <option value="failed">failed</option>
              <option value="running">running</option>
            </Select>
          </div>

          <div className="runs-controls__field">
            <Select
              label="Page Size"
              onChange={(event) => {
                const nextPageSize = Number.parseInt(event.currentTarget.value, 10)

                setTableQueryState({
                  ...tableQueryState,
                  page: DEFAULT_PAGE,
                  pageSize: PAGE_SIZE_OPTIONS.includes(nextPageSize as 10 | 20 | 50)
                    ? nextPageSize
                    : DEFAULT_PAGE_SIZE,
                })
              }}
              value={String(tableQueryState.pageSize)}
            >
              {PAGE_SIZE_OPTIONS.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {isRefreshing ? (
          <p className="runs-loading-inline">Refreshing run results...</p>
        ) : null}
      </Card>

      {loadState === 'error' ? (
        <div className="runs-error-banner" role="alert">
          <span>{errorMessage}</span>
          <Button onClick={() => setRefreshTick((value) => value + 1)} variant="secondary">
            Retry
          </Button>
        </div>
      ) : null}

      {isInitialLoading ? (
        <Card className="state-card" title="Loading runs">
          <p className="state-text">Fetching run history...</p>
        </Card>
      ) : null}

      {isEmptyResult ? (
        <Card className="state-card" title="No matching runs">
          <p className="state-text">
            No rows match your current query and filters.
          </p>
        </Card>
      ) : null}

      {result.items.length > 0 ? (
        <Card
          subtitle={`Showing ${result.items.length} of ${formatNumber(result.total, 0)} runs`}
          title="Run List"
        >
          <div className="table-wrap">
            <table className="runs-table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    className="runs-table__row"
                    key={row.id}
                    onClick={() => {
                      navigate(`/runs/${row.original.id}`)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/runs/${row.original.id}`)
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="runs-pagination">
            <Button
              disabled={tableQueryState.page <= 1 || loadState === 'loading'}
              onClick={() => {
                setTableQueryState({
                  ...tableQueryState,
                  page: Math.max(1, tableQueryState.page - 1),
                })
              }}
              variant="secondary"
            >
              Prev
            </Button>

            <p className="runs-pagination__meta">
              Page {tableQueryState.page} of {totalPages} ({formatNumber(result.total, 0)} total)
            </p>

            <Button
              disabled={tableQueryState.page >= totalPages || loadState === 'loading'}
              onClick={() => {
                setTableQueryState({
                  ...tableQueryState,
                  page: Math.min(totalPages, tableQueryState.page + 1),
                })
              }}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
