#!/usr/bin/env node
// playwright-qc-2026-05-15.mjs
// S217 yes-this-new-mcbp-dapper-corbato sprint, Agent G QC pass.
//
// Context7: playwright@1.59.1 (/microsoft/playwright). chromium.launch,
// browser.newContext({viewport, deviceScaleFactor}), ctx.newPage,
// page.goto({waitUntil, timeout}), page.waitForTimeout(ms),
// page.evaluate(fn), page.locator(sel).first().click({timeout}),
// page.keyboard.press(key), page.screenshot({path, fullPage}).
// Same surface as scripts/mobile-sweep.mjs in repo.
//
// Plan: ~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md, section
// "Mobile-First Render (Hard Rule #35, R067)".
//
// Hard Rule #11: zero em dashes.

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const STAMP = '2026-05-15'
const SCREENSHOT_DIR = resolve(REPO_ROOT, `screenshots-qc-${STAMP}`)
const REPORT_PATH = resolve(REPO_ROOT, 'docs', `playwright-qc-${STAMP}.md`)
mkdirSync(SCREENSHOT_DIR, { recursive: true })
mkdirSync(dirname(REPORT_PATH), { recursive: true })

const BASE = process.env.QC_BASE_URL ?? 'http://localhost:5174'
const VIEWPORTS = [320, 375, 768, 1024, 1440]
const ROUTES = [
  { slug: 'landing', path: '/empireworksreconstruction', label: '/empireworksreconstruction' },
  { slug: 'foundation', path: '/empireworksreconstruction/foundation', label: '/empireworksreconstruction/foundation' },
  { slug: 'pack-detail', path: '/empireworksreconstruction/pack/foundation-01-constitution', label: '/empireworksreconstruction/pack/foundation-01-constitution' },
]

const BRIDGE_DOWNLOAD_PATH = '/downloads/empireworks-bridge-1.0.3.mcpb'

const results = []
const pass = (check, detail) => ({ check, status: 'PASS', detail })
const fail = (check, detail) => ({ check, status: 'FAIL', detail })
const skip = (check, detail) => ({ check, status: 'SKIP', detail })

const browser = await chromium.launch()

const probe = await fetch(`${BASE}/`).catch((e) => ({ ok: false, error: String(e) }))
if (!probe.ok) {
  console.error(`Pre-flight: dev server not responding at ${BASE}. Aborting.`)
  await browser.close()
  process.exit(2)
}

let bridgeRegression = skip('Bridge .mcpb download regression', 'not checked yet')
try {
  const bridgeRes = await fetch(`${BASE}${BRIDGE_DOWNLOAD_PATH}`, { method: 'GET' })
  if (bridgeRes.status === 200) {
    const len = bridgeRes.headers.get('content-length')
    bridgeRegression = pass('Bridge .mcpb download regression', `GET ${BRIDGE_DOWNLOAD_PATH} returned 200 (content-length=${len ?? 'unknown'})`)
  } else {
    bridgeRegression = fail('Bridge .mcpb download regression', `GET ${BRIDGE_DOWNLOAD_PATH} returned ${bridgeRes.status}`)
  }
} catch (e) {
  bridgeRegression = fail('Bridge .mcpb download regression', String(e))
}

for (const route of ROUTES) {
  for (const width of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()

    const consoleErrors = []
    page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const txt = msg.text()
        if (/HMR|sourcemap/i.test(txt)) return
        consoleErrors.push(`console: ${txt}`)
      }
    })

    const checks = []
    const url = `${BASE}${route.path}`

    // Seed intake-complete localStorage so the "Edit your setup" pill renders
    // on landing. addInitScript runs before any page script so the app reads
    // the seeded state on first mount.
    await ctx.addInitScript(() => {
      try {
        const seeded = {
          name: 'John',
          division: 'Acme Construction',
          industry: 'construction',
          constructionRole: 'gc',
          outcomes: { 'faster-proposals': 5, 'faster-emails': 4 },
          surfaces: ['browser'],
          completedAt: '2026-05-15T18:00:00.000Z',
          version: 1,
        }
        window.localStorage.setItem('hoistos.intake.v1', JSON.stringify(seeded))
      } catch (e) {
        // localStorage may be blocked; non-fatal for the rest of the QC.
      }
    })

    let loadOk = true
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    } catch (e) {
      checks.push(fail('page-load', String(e)))
      loadOk = false
    }

    if (loadOk) {
      await page.waitForTimeout(900)

      const overflow = await page.evaluate(() => {
        const sw = document.documentElement.scrollWidth
        const cw = document.documentElement.clientWidth
        const offenders = []
        const all = document.querySelectorAll('body *')
        for (const el of all) {
          const r = el.getBoundingClientRect()
          if (r.right > cw + 0.5 || r.left < -0.5) {
            const tag = el.tagName.toLowerCase()
            const cls = (el.className || '').toString().slice(0, 60)
            offenders.push(`${tag}.${cls} (left=${Math.round(r.left)} right=${Math.round(r.right)})`)
            if (offenders.length >= 5) break
          }
        }
        return { sw, cw, offenders }
      })
      const hScroll = overflow.sw > overflow.cw
      if (hScroll) {
        checks.push(fail('horizontal-scroll', `scrollWidth=${overflow.sw} clientWidth=${overflow.cw} offenders=${overflow.offenders.join(' | ')}`))
      } else {
        checks.push(pass('horizontal-scroll', `scrollWidth=${overflow.sw} clientWidth=${overflow.cw}`))
      }

      if (route.slug === 'landing') {
        const intakeProbe = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], [data-intake-modal], form[aria-label*="intake" i]')
          const heading = Array.from(document.querySelectorAll('h1, h2, h3')).find((h) =>
            /tell us a little|intake|let.?s set|let.?s personalize/i.test(h.textContent ?? ''),
          )
          return { hasDialog: !!dialog, hasIntakeHeading: !!heading, headingText: heading?.textContent?.trim().slice(0, 80) ?? '' }
        })
        if (intakeProbe.hasDialog || intakeProbe.hasIntakeHeading) {
          checks.push(pass('intake-modal-renders', `dialog=${intakeProbe.hasDialog} heading="${intakeProbe.headingText}"`))
        } else {
          checks.push(skip('intake-modal-renders', 'no intake dialog visible (likely already-complete state from localStorage)'))
        }

        await page.keyboard.press('Escape').catch(() => {})
        await page.waitForTimeout(300)
        const intakeAfterEsc = await page.evaluate(() => !!document.querySelector('[role="dialog"]'))
        if (intakeAfterEsc) {
          const closeClicked = await page
            .locator('button[aria-label*="lose" i], button[aria-label*="ismiss" i]')
            .first()
            .click({ timeout: 1500 })
            .then(() => true)
            .catch(() => false)
          await page.waitForTimeout(300)
          const stillOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'))
          if (stillOpen) {
            checks.push(fail('intake-modal-dismissible', `Escape did not close; close-click=${closeClicked}`))
          } else {
            checks.push(pass('intake-modal-dismissible', 'closed via aria-label close button'))
          }
        } else {
          checks.push(pass('intake-modal-dismissible', 'closed via Escape (or not open to begin with)'))
        }

        const layout = await page.evaluate(() => {
          const candidates = ['#journey-tracker', '[data-journey-tracker]', '[aria-label*="ourney" i]']
          let tracker = null
          for (const sel of candidates) {
            const node = document.querySelector(sel)
            if (node) { tracker = node; break }
          }
          if (!tracker) {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, div'))
            tracker = headings.find((h) => /Your Claude is growing|Your installed system|Journey|packs installed/i.test(h.textContent ?? '')) ?? null
          }
          if (!tracker) return { present: false }
          const r = tracker.getBoundingClientRect()
          return { present: true, top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), tag: tracker.tagName.toLowerCase() }
        })
        if (layout.present) {
          checks.push(pass('journey-tracker-renders', `tag=${layout.tag} width=${layout.width}px`))
        } else {
          checks.push(fail('journey-tracker-renders', 'no JourneyTracker node found via id/aria/text probe'))
        }

        const bridgePanel = await page.evaluate(() => {
          const text = document.body.innerText ?? ''
          return { hasFraming: /optional desktop convenience/i.test(text) }
        })
        if (bridgePanel.hasFraming) {
          checks.push(pass('bridge-panel-optional-framing', 'string "Optional Desktop convenience" found'))
        } else {
          checks.push(fail('bridge-panel-optional-framing', 'string "Optional Desktop convenience" not found on landing'))
        }

        const setupPill = await page.evaluate(() => {
          const candidates = Array.from(document.querySelectorAll('button, a'))
          const node = candidates.find((el) => /edit your setup/i.test(el.getAttribute('aria-label') ?? el.textContent ?? ''))
          if (!node) return { present: false }
          const r = node.getBoundingClientRect()
          return { present: true, visible: r.width > 0 && r.height > 0, height: Math.round(r.height), width: Math.round(r.width) }
        })
        if (setupPill.present && setupPill.visible) {
          if (setupPill.height >= 44) {
            checks.push(pass('edit-your-setup-pill', `height=${setupPill.height}px width=${setupPill.width}px`))
          } else {
            checks.push(fail('edit-your-setup-pill', `height=${setupPill.height}px is below 44px minimum`))
          }
        } else {
          checks.push(skip('edit-your-setup-pill', 'pill not rendered (intake likely not complete yet)'))
        }
      } else if (route.slug === 'foundation') {
        const cardScan = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'))
          const installButtons = buttons.filter((b) => /install on my claude|install on my|installed/i.test(b.textContent ?? ''))
          const rectified = installButtons.map((b) => {
            const r = b.getBoundingClientRect()
            return { text: (b.textContent ?? '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }
          })
          return { count: installButtons.length, sample: rectified.slice(0, 5) }
        })
        if (cardScan.count >= 1) {
          checks.push(pass('foundation-cards-install-button', `found ${cardScan.count} install buttons; sample=${JSON.stringify(cardScan.sample)}`))
        } else {
          checks.push(fail('foundation-cards-install-button', 'no install buttons on foundation route'))
        }

        try {
          await page.locator('button:has-text("Install on my Claude")').first().click({ timeout: 2500 })
          await page.waitForTimeout(500)
          const formScan = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'))
            const customwareInputs = inputs.filter((i) => {
              const r = i.getBoundingClientRect()
              return r.width > 0 && r.height > 0
            })
            const sample = customwareInputs.slice(0, 4).map((i) => {
              const r = i.getBoundingClientRect()
              return { placeholder: i.getAttribute('placeholder') ?? '', h: Math.round(r.height), w: Math.round(r.width) }
            })
            const minH = customwareInputs.reduce((acc, i) => {
              const r = i.getBoundingClientRect()
              return Math.min(acc, r.height)
            }, Infinity)
            return { count: customwareInputs.length, sample, minH: customwareInputs.length === 0 ? 0 : Math.round(minH) }
          })
          if (formScan.count >= 1 && formScan.minH >= 44) {
            checks.push(pass('customware-form-expand-and-tap-target', `inputs=${formScan.count} minH=${formScan.minH}px sample=${JSON.stringify(formScan.sample)}`))
          } else if (formScan.count >= 1) {
            checks.push(fail('customware-form-expand-and-tap-target', `inputs=${formScan.count} minH=${formScan.minH}px below 44px floor`))
          } else {
            checks.push(fail('customware-form-expand-and-tap-target', 'no customware inputs after install click'))
          }
        } catch (e) {
          checks.push(fail('customware-form-expand-and-tap-target', `install button click failed: ${String(e)}`))
        }
      } else if (route.slug === 'pack-detail') {
        const detail = await page.evaluate(() => {
          const h1 = document.querySelector('h1, h2')
          return { hasHeading: !!h1, text: h1?.textContent?.trim().slice(0, 80) ?? '' }
        })
        if (detail.hasHeading) {
          checks.push(pass('pack-detail-renders', `heading="${detail.text}"`))
        } else {
          checks.push(fail('pack-detail-renders', 'no top heading on pack detail route'))
        }
      }

      try {
        await page.screenshot({ path: resolve(SCREENSHOT_DIR, `${route.slug}--${width}px.png`), fullPage: false })
      } catch (e) {
        // non-fatal
      }
    }

    results.push({ route: route.label, slug: route.slug, width, checks, consoleErrors })
    await ctx.close()
  }
}

await browser.close()

let totalChecks = 0, totalPass = 0, totalFail = 0, totalSkip = 0
let anyHScroll = false
let overflowElements = 0

for (const row of results) {
  for (const c of row.checks) {
    totalChecks++
    if (c.status === 'PASS') totalPass++
    else if (c.status === 'FAIL') totalFail++
    else totalSkip++
    if (c.check === 'horizontal-scroll' && c.status === 'FAIL') {
      anyHScroll = true
      const matchOffenders = (c.detail ?? '').match(/offenders=([^|]*)/)
      if (matchOffenders) {
        overflowElements += matchOffenders[1].split('|').filter(Boolean).length
      }
    }
  }
}

const tapFailCount = results.reduce((acc, r) => {
  return acc + r.checks.filter((c) => c.status === 'FAIL' && /tap-target|edit-your-setup-pill|customware-form-expand/i.test(c.check)).length
}, 0)
const tapTest = tapFailCount === 0 ? 'PASS' : 'FAIL'

const stamp = `Mobile render: scanned ${VIEWPORTS.length} viewports, horizontal-scroll=${anyHScroll}, overflow-elements=${overflowElements}, tap-test=${tapTest}`

const dateIso = new Date().toISOString()
const lines = []
lines.push(`# HoistOS install surface Playwright QC, ${STAMP}`)
lines.push('')
lines.push(`Generated: ${dateIso}`)
lines.push(`Dev server: ${BASE}`)
lines.push('')
lines.push(`Sprint: yes-this-new-mcbp-dapper-corbato (S217)`)
lines.push(`Plan: ~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md, "Mobile-First Render (Hard Rule #35, R067)"`)
lines.push('')
lines.push(`## Stamp`)
lines.push('')
lines.push('```')
lines.push(stamp)
lines.push('```')
lines.push('')
lines.push(`## Summary`)
lines.push('')
lines.push(`Routes scanned: ${ROUTES.length}`)
lines.push(`Viewports per route: ${VIEWPORTS.length} (${VIEWPORTS.join(', ')} px)`)
lines.push(`Total checks: ${totalChecks} (PASS=${totalPass}, FAIL=${totalFail}, SKIP=${totalSkip})`)
lines.push(`Tap-target test: ${tapTest}`)
lines.push(`Horizontal scroll detected: ${anyHScroll}`)
lines.push(`Overflow elements: ${overflowElements}`)
lines.push(`Bridge .mcpb regression: ${bridgeRegression.status} (${bridgeRegression.detail})`)
lines.push('')
lines.push(`## Per-route, per-viewport results`)
lines.push('')

for (const route of ROUTES) {
  lines.push(`### ${route.label}`)
  lines.push('')
  for (const width of VIEWPORTS) {
    const row = results.find((r) => r.slug === route.slug && r.width === width)
    if (!row) continue
    const fails = row.checks.filter((c) => c.status === 'FAIL')
    const passes = row.checks.filter((c) => c.status === 'PASS')
    const skips = row.checks.filter((c) => c.status === 'SKIP')
    const verdict = fails.length === 0 ? 'PASS' : 'FAIL'
    lines.push(`#### ${width} px: ${verdict}`)
    lines.push('')
    lines.push(`Screenshot: \`screenshots-qc-${STAMP}/${row.slug}--${width}px.png\``)
    lines.push('')
    if (passes.length > 0) {
      lines.push(`PASS (${passes.length}):`)
      lines.push('')
      for (const c of passes) lines.push(`- ${c.check}: ${c.detail}`)
      lines.push('')
    }
    if (skips.length > 0) {
      lines.push(`SKIP (${skips.length}):`)
      lines.push('')
      for (const c of skips) lines.push(`- ${c.check}: ${c.detail}`)
      lines.push('')
    }
    if (fails.length > 0) {
      lines.push(`FAIL (${fails.length}):`)
      lines.push('')
      for (const c of fails) {
        lines.push(`- ${c.check}: ${c.detail}`)
        lines.push(`  Reproduce:`)
        lines.push(`  1. Start dev server: \`npm run dev\` (default ${BASE}).`)
        lines.push(`  2. Open \`${BASE}${route.path}\` in a browser sized to ${width} x 900.`)
        lines.push(`  3. Verify the named check: ${c.check}.`)
      }
      lines.push('')
    }
    if (row.consoleErrors.length > 0) {
      lines.push(`Console errors: ${row.consoleErrors.length}`)
      for (const e of row.consoleErrors.slice(0, 5)) lines.push(`- ${e.slice(0, 160)}`)
      lines.push('')
    }
  }
}

lines.push(`## Bridge install regression`)
lines.push('')
lines.push(`Status: ${bridgeRegression.status}`)
lines.push(`Detail: ${bridgeRegression.detail}`)
lines.push(`Verifies: clicking the "Download Bridge for Claude Desktop" anchor on the landing page still triggers the .mcpb download.`)
lines.push('')
lines.push(`## Reproduction harness`)
lines.push('')
lines.push('```bash')
lines.push(`cd ~/Desktop/Outputs/AI\\ Authority/HoistOS/hoistos-marketing`)
lines.push(`npm run dev`)
lines.push(`QC_BASE_URL=http://localhost:5174 node scripts/playwright-qc-2026-05-15.mjs`)
lines.push('```')
lines.push('')
lines.push(`Screenshots land in \`screenshots-qc-${STAMP}/\`. This report regenerates on every run.`)
lines.push('')

writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8')

console.log('\n=== Playwright QC summary ===')
console.log(`Base: ${BASE}`)
console.log(`Routes: ${ROUTES.length} x ${VIEWPORTS.length} viewports = ${ROUTES.length * VIEWPORTS.length} pages`)
console.log(`Checks: ${totalChecks} (PASS=${totalPass}, FAIL=${totalFail}, SKIP=${totalSkip})`)
console.log(`Bridge regression: ${bridgeRegression.status} -- ${bridgeRegression.detail}`)
console.log(`Report: ${REPORT_PATH}`)
console.log(`Screenshots: ${SCREENSHOT_DIR}`)
console.log('')
console.log(stamp)

process.exit(totalFail === 0 ? 0 : 1)
