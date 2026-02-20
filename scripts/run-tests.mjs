import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = mkdtempSync(path.join(tmpdir(), 'portfolio-dashboard-tests-'))
const tscPath = path.resolve(repoRoot, 'node_modules/typescript/bin/tsc')

function compileTestTargets() {
  execFileSync(
    process.execPath,
    [
      tscPath,
      '--pretty',
      'false',
      '--skipLibCheck',
      '--module',
      'commonjs',
      '--target',
      'ES2020',
      '--moduleResolution',
      'node',
      '--outDir',
      outDir,
      '--rootDir',
      'src',
      'src/features/runs/types.ts',
      'src/features/runs/mockData.ts',
      'src/features/runs/mockApi.ts',
      'src/features/runs/queryState.ts',
    ],
    {
      cwd: repoRoot,
      stdio: 'pipe',
    },
  )
}

async function run() {
  try {
    compileTestTargets()

    const mockApiPath = path.join(outDir, 'features/runs/mockApi.js')
    const queryStatePath = path.join(outDir, 'features/runs/queryState.js')

    const { listRuns } = require(mockApiPath)
    const {
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_DIR,
      DEFAULT_STATUS,
      parseRunsQueryState,
    } = require(queryStatePath)

    const filtered = await listRuns({
      forceError: false,
      page: 1,
      pageSize: 5,
      query: 'usd',
      sortBy: 'pf',
      sortDir: 'desc',
      status: 'done',
    })

    assert.ok(filtered.items.length <= 5, 'listRuns should obey page size')
    assert.ok(filtered.total >= filtered.items.length, 'listRuns total should be >= page size')
    assert.ok(filtered.items.length > 0, 'listRuns should return at least one row for test case')

    filtered.items.forEach((item) => {
      assert.equal(item.status, 'done', 'status filter should return done rows only')
      assert.ok(
        item.pair.toLowerCase().includes('usd') ||
          item.timeframe.toLowerCase().includes('usd') ||
          item.status.toLowerCase().includes('usd'),
        'query filter should match pair, timeframe, or status',
      )
    })

    for (let index = 1; index < filtered.items.length; index += 1) {
      assert.ok(
        filtered.items[index - 1].pf >= filtered.items[index].pf,
        'pf sorting should be descending',
      )
    }

    const pageOne = await listRuns({
      forceError: false,
      page: 1,
      pageSize: 3,
      sortBy: 'createdAt',
      sortDir: 'desc',
    })

    const pageTwo = await listRuns({
      forceError: false,
      page: 2,
      pageSize: 3,
      sortBy: 'createdAt',
      sortDir: 'desc',
    })

    const pageOneIds = pageOne.items.map((run) => run.id)
    const pageTwoIds = pageTwo.items.map((run) => run.id)

    assert.ok(pageOneIds.length > 0, 'page one should contain rows')
    assert.ok(pageTwoIds.length > 0, 'page two should contain rows')
    assert.ok(
      pageOneIds.every((id) => !pageTwoIds.includes(id)),
      'pagination should not repeat ids between page 1 and page 2',
    )

    const parsedDefaults = parseRunsQueryState(
      new URLSearchParams('status=invalid&sort=wat&page=-3&pageSize=999'),
    )

    assert.equal(parsedDefaults.status, DEFAULT_STATUS)
    assert.equal(parsedDefaults.sortBy, DEFAULT_SORT_BY)
    assert.equal(parsedDefaults.sortDir, DEFAULT_SORT_DIR)
    assert.equal(parsedDefaults.page, DEFAULT_PAGE)
    assert.equal(parsedDefaults.pageSize, DEFAULT_PAGE_SIZE)

    console.log('All lightweight tests passed.')
  } finally {
    rmSync(outDir, { force: true, recursive: true })
  }
}

await run()
