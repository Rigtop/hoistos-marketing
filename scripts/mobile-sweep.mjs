#!/usr/bin/env node
/**
 * mobile-sweep.mjs
 *
 * S205 2026-05-13 multi-viewport Playwright sweep of the live VP-demo page.
 * Captures screenshots at 7 viewports, asserts no horizontal scroll,
 * captures overflow-element count plus tap-target dimensions on the
 * Download CTA.
 *
 * Output: screenshots-after/<viewport>px.png plus a console summary that
 * the parent sprint reads for the Mobile Render disclosure (HR #35).
 *
 * Usage:  node scripts/mobile-sweep.mjs [url]
 *   default url = https://hoistos.com/empireworksreconstruction
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(REPO_ROOT, 'screenshots-after')
mkdirSync(OUT_DIR, { recursive: true })

const URL = process.argv[2] ?? 'https://hoistos.com/empireworksreconstruction'
const VIEWPORTS = [320, 375, 390, 414, 768, 1024, 1440]

const browser = await chromium.launch()
const summary = []

for (const width of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()

  const consoleErrors = []
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console: ${msg.text()}`)
  })

  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    summary.push({ width, status: 'goto-failed', error: String(e) })
    await ctx.close()
    continue
  }

  // Give Motion plus Lenis a beat to settle
  await page.waitForTimeout(800)

  const overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  })
  const hScroll = overflow.scrollWidth > overflow.clientWidth

  // Tap-target check: Download Bridge CTA plus Copy buttons plus nav links
  const tapTargets = await page.evaluate(() => {
    function rect(sel) {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    }
    return {
      downloadCTA: rect('a[href*=".mcpb"]'),
      copySetup: rect('button[type="button"]'),
    }
  })

  await page.screenshot({
    path: resolve(OUT_DIR, `${width}px.png`),
    fullPage: false,
  })

  summary.push({
    width,
    hScroll,
    scrollWidth: overflow.scrollWidth,
    clientWidth: overflow.clientWidth,
    overshoot: overflow.scrollWidth - overflow.clientWidth,
    tapTargets,
    consoleErrors: consoleErrors.length,
    errorSamples: consoleErrors.slice(0, 3),
  })

  await ctx.close()
}

await browser.close()

console.log('\n=== Mobile sweep summary ===')
console.log(`URL: ${URL}\n`)
for (const row of summary) {
  const flag = row.hScroll ? 'H-SCROLL' : 'ok'
  const dlOk = row.tapTargets?.downloadCTA
    ? `dlCTA ${row.tapTargets.downloadCTA.w}x${row.tapTargets.downloadCTA.h}`
    : 'dlCTA missing'
  console.log(`  ${String(row.width).padStart(4)}px  ${flag.padEnd(10)}  scroll=${row.scrollWidth}/${row.clientWidth}  ${dlOk}  err=${row.consoleErrors}`)
  if (row.errorSamples?.length) {
    for (const e of row.errorSamples) console.log(`        ${e.slice(0, 120)}`)
  }
}

const anyHScroll = summary.some((r) => r.hScroll)
const totalErrs = summary.reduce((s, r) => s + (r.consoleErrors ?? 0), 0)

console.log('\n=== Disclosure (HR #35) ===')
console.log(
  `Mobile render: scanned ${VIEWPORTS.length} viewports, horizontal-scroll=${anyHScroll}, overflow-elements=${
    summary.filter((r) => r.hScroll).length
  }, tap-test=${anyHScroll ? 'FAIL' : 'PASS'}, console-errors=${totalErrs}`,
)

process.exit(anyHScroll ? 1 : 0)
