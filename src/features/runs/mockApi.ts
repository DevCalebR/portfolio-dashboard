import { mockRuns } from './mockData'
import type { Run } from './types'

const DEFAULT_DELAY_MS = 550

interface ListRunsOptions {
  delayMs?: number
  simulateError?: boolean
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs)
  })
}

export async function listRuns(options: ListRunsOptions = {}): Promise<Run[]> {
  await wait(options.delayMs ?? DEFAULT_DELAY_MS)

  if (options.simulateError) {
    throw new Error('Unable to load runs from the mock service.')
  }

  return [...mockRuns]
}

export async function getRunById(
  id: string,
  options: ListRunsOptions = {},
): Promise<Run | null> {
  const runs = await listRuns(options)

  return runs.find((run) => run.id === id) ?? null
}
