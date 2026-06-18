import { accessSync, copyFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envExamplePath = path.join(repoRoot, '.env.example')
const envLocalPath = path.join(repoRoot, '.env.local')

function exists(filePath) {
  try {
    accessSync(filePath)
    return true
  } catch {
    return false
  }
}

if (!exists(envExamplePath)) {
  throw new Error('.env.example is missing. Add it before running setup.')
}

if (exists(envLocalPath)) {
  console.log('.env.local already exists. Skipping copy.')
  process.exit(0)
}

copyFileSync(envExamplePath, envLocalPath)
console.log('Created .env.local from .env.example. Update values before deploy.')
