#!/usr/bin/env node
/**
 * copy-bridge-mcpb.mjs
 *
 * Pre-build hook. Mirrors the latest empireworks-bridge .mcpb artifacts from
 * the sibling empireworks-bridge/dist/ directory into public/downloads/ so
 * Vite copies them into the deploy at build time.
 *
 * Why: the marketing site links to /downloads/empireworks-bridge-<ver>.mcpb
 * but the .mcpb is produced by the empireworks-bridge repo's build pipeline.
 * Without this sync step, Vercel's clean rebuild has no .mcpb in public/, so
 * the download link 404s. Fixed S205 2026-05-13.
 *
 * Behavior:
 *   - If the sibling bridge/dist exists, copy every .mcpb into public/downloads
 *   - If the sibling repo is missing (Vercel build env), skip silently. The
 *     committed .mcpb files in public/downloads/ remain authoritative for the
 *     production deploy.
 *
 * Idempotent. Safe to run on every build.
 */

import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const BRIDGE_DIST = resolve(REPO_ROOT, '..', 'empireworks-bridge', 'dist')
const PUBLIC_DOWNLOADS = resolve(REPO_ROOT, 'public', 'downloads')

function copyBridgeArtifacts() {
  if (!existsSync(BRIDGE_DIST)) {
    console.log('[copy-bridge-mcpb] skipping: ../empireworks-bridge/dist not present (build env)')
    return
  }

  if (!existsSync(PUBLIC_DOWNLOADS)) {
    mkdirSync(PUBLIC_DOWNLOADS, { recursive: true })
  }

  const candidates = readdirSync(BRIDGE_DIST).filter((f) => f.endsWith('.mcpb'))
  if (candidates.length === 0) {
    console.log('[copy-bridge-mcpb] skipping: no .mcpb files in bridge/dist')
    return
  }

  let copied = 0
  let skipped = 0
  for (const file of candidates) {
    const src = join(BRIDGE_DIST, file)
    const dst = join(PUBLIC_DOWNLOADS, file)

    const srcSize = statSync(src).size
    if (existsSync(dst) && statSync(dst).size === srcSize) {
      skipped += 1
      continue
    }

    copyFileSync(src, dst)
    copied += 1
    console.log(`[copy-bridge-mcpb] copied ${file} (${(srcSize / 1024 / 1024).toFixed(2)} MB)`)
  }

  console.log(`[copy-bridge-mcpb] done: ${copied} copied, ${skipped} unchanged`)
}

copyBridgeArtifacts()
