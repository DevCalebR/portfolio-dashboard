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
import {
  createRunsSearchParams,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_DIR,
  DEFAULT_STATUS,
  PAGE_SIZE_OPTIONS,
  parseRunsQueryState,
  type RunsQueryState,
} from '../features/runs/queryState'
import { listRuns } from '../features/runs/mockApi'
import type {
  ListRunsResult,
  Run,
  RunSortBy,
  RunStatus,
} from '../features/runs/types'
import { formatDate, formatNumber, formatPercent } from '../lib/format'

type LoadState = 'error' | 'loading' | 'success'

function isRunSortBy(value: string | null): value is RunSortBy {
  return (
    value === 'createdAt' ||
    value === 'maxDD' ||
    value === 'pf' ||
    value === 'trades'
  )
}

function isRunStatus(value: string): value is RunStatus {
  return (
    value === 'done' ||
    value === 'failed' ||
    value === 'queued' ||
    value === 'running'
  )
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
      aria-label={`Sort by ${label}${
        sorting === 'asc' ? ', currently ascending' : sorting === 'desc' ? ', currently descending' : ''
      }`}
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

const statusLegend: Array<{ label: RunStatus; tone: 'danger' | 'neutral' | 'success' | 'warning' }> = [
  { label: 'done', tone: 'success' },
  { label: 'running', tone: 'warning' },
  { label: 'queued', tone: 'neutral' },
  { label: 'failed', tone: 'danger' },
]

export function RunsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const tableQueryState = useMemo(
    () => parseRunsQueryState(searchParams),
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
    (nextState: RunsQueryState, replace = false) => {
      setSearchParams(createRunsSearchParams(nextState), { replace })
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
              aria-label="Search runs"
              helperText="Matches pair, timeframe, and status values."
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
              aria-label="Filter runs by status"
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
              aria-label="Select page size"
              helperText="Controls number of rows shown per page."
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

        <div className="runs-status-legend" aria-label="Status legend">
          <span className="runs-status-legend__label">Status Legend:</span>
          {statusLegend.map((entry) => (
            <div className="runs-status-legend__item" key={entry.label}>
              <Badge variant={entry.tone}>{entry.label}</Badge>
            </div>
          ))}
        </div>

        {isRefreshing ? (
          <p className="runs-loading-inline" role="status">
            Refreshing run results...
          </p>
        ) : null}
      </Card>

      {loadState === 'error' ? (
        <div className="runs-error-banner" role="alert">
          <span>{errorMessage}</span>
          <Button
            aria-label="Retry loading runs"
            onClick={() => setRefreshTick((value) => value + 1)}
            variant="secondary"
          >
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
          <div className="state-card__actions">
            <Link className="ui-button ui-button--secondary" to="/runs/new">
              Create New Run
            </Link>
          </div>
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
                      <th key={header.id} scope="col">
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
                    aria-label={`Open details for ${row.original.id}`}
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
              aria-label="Go to previous page"
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
              aria-label="Go to next page"
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
