import assert from 'node:assert/strict'
import { accessSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(repoRoot, 'dist')
const indexPath = path.join(distDir, 'index.html')
const redirectsPath = path.join(distDir, '_redirects')

accessSync(indexPath)
accessSync(redirectsPath)

const html = readFileSync(indexPath, 'utf8')
const redirects = readFileSync(redirectsPath, 'utf8').trim()

assert.match(html, /<div id="root"><\/div>/, 'dist/index.html is missing the root mount node.')
assert.match(
  html,
  /assets\/index-[^"]+\.js/,
  'dist/index.html is missing the built entry JavaScript asset.',
)
assert.equal(redirects, '/* /index.html 200', 'dist/_redirects must preserve SPA routing.')

console.log('Smoke checks passed for built output.')
