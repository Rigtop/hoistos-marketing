/**
 * OG image generator: canvas-based, brand-aware.
 *
 * Produces a 1200x630 PNG suitable for Open Graph / Twitter Cards / LinkedIn.
 * Uses the active document's CSS theme vars so the output matches the
 * scaffolded project's brand preset (HoistOS or Claude Design).
 *
 * Two modes:
 *   In browser: call generateOgImage(opts) and get a dataURL or Blob.
 *   In bin/og CLI (Node): TODO; canvas in Node needs node-canvas. For now,
 *   run from the dev server: visit /og?title=... and right-click save.
 *
 * Usage in app:
 *   const url = await generateOgImage({ title: 'HoistOS', subtitle: 'Construction OS' })
 *   document.querySelector('meta[property=og:image]')!.setAttribute('content', url)
 */

export type OgOptions = {
  title: string
  subtitle?: string
  /** Brand mark text shown small in corner. Default 'visual-stack'. */
  brand?: string
  /** Theme: reads CSS vars from document.documentElement. */
  theme?: 'hoistos' | 'claude'
  width?: number
  height?: number
}

function readTheme(theme?: 'hoistos' | 'claude') {
  const html = document.documentElement
  const prev = html.getAttribute('data-theme')
  if (theme) html.setAttribute('data-theme', theme)
  const styles = getComputedStyle(html)
  const out = {
    bg: styles.getPropertyValue('--color-bg').trim(),
    surface: styles.getPropertyValue('--color-surface').trim(),
    fg: styles.getPropertyValue('--color-fg').trim(),
    fgMuted: styles.getPropertyValue('--color-fg-muted').trim(),
    fgSubtle: styles.getPropertyValue('--color-fg-subtle').trim(),
    accent: styles.getPropertyValue('--color-accent').trim(),
    accent2: styles.getPropertyValue('--color-accent-2').trim(),
  }
  if (theme && prev) html.setAttribute('data-theme', prev)
  else if (theme && !prev) html.removeAttribute('data-theme')
  return out
}

export async function generateOgImage(opts: OgOptions): Promise<string> {
  const W = opts.width ?? 1200
  const H = opts.height ?? 630

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const colors = readTheme(opts.theme)

  ctx.fillStyle = `rgb(${colors.bg})`
  ctx.fillRect(0, 0, W, H)

  const grad1 = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, W * 0.6)
  grad1.addColorStop(0, `rgb(${colors.accent} / 0.45)`)
  grad1.addColorStop(1, `rgb(${colors.accent} / 0)`)
  ctx.fillStyle = grad1
  ctx.fillRect(0, 0, W, H)

  const grad2 = ctx.createRadialGradient(W * 0.1, H * 0.9, 0, W * 0.1, H * 0.9, W * 0.5)
  grad2.addColorStop(0, `rgb(${colors.accent2} / 0.3)`)
  grad2.addColorStop(1, `rgb(${colors.accent2} / 0)`)
  ctx.fillStyle = grad2
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = `rgb(${colors.fgSubtle} / 0.08)`
  ctx.lineWidth = 1
  const grid = 80
  for (let x = 0; x <= W; x += grid) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y <= H; y += grid) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  const brand = opts.brand ?? 'visual-stack'
  ctx.fillStyle = `rgb(${colors.accent})`
  ctx.font = '500 18px "JetBrains Mono", Menlo, monospace'
  ctx.fillText(brand.toUpperCase(), 80, 100)

  ctx.fillRect(80, 110, 32, 1.5)

  ctx.fillStyle = `rgb(${colors.fg})`
  const titleSize = opts.title.length > 50 ? 64 : opts.title.length > 30 ? 80 : 96
  ctx.font = `400 ${titleSize}px "DM Serif Display", "EB Garamond", Georgia, serif`
  const words = opts.title.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > W - 160) {
      if (line) lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)

  const lineHeight = titleSize * 0.95
  let y = 200
  for (const l of lines) {
    ctx.fillText(l, 80, y)
    y += lineHeight
  }

  if (opts.subtitle) {
    ctx.fillStyle = `rgb(${colors.fgMuted})`
    ctx.font = '300 28px Inter, system-ui, sans-serif'
    const subY = Math.max(y + 30, H - 130)
    const subWords = opts.subtitle.split(' ')
    let subLine = ''
    let sy = subY
    for (const w of subWords) {
      const test = subLine ? `${subLine} ${w}` : w
      if (ctx.measureText(test).width > W - 160) {
        ctx.fillText(subLine, 80, sy)
        subLine = w
        sy += 36
      } else subLine = test
    }
    if (subLine) ctx.fillText(subLine, 80, sy)
  }

  const cornerSize = 60
  ctx.strokeStyle = `rgb(${colors.accent})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W - 80 - cornerSize, H - 80)
  ctx.lineTo(W - 80, H - 80)
  ctx.lineTo(W - 80, H - 80 - cornerSize)
  ctx.stroke()

  return canvas.toDataURL('image/png')
}

export async function downloadOgImage(opts: OgOptions, filename = 'og.png') {
  const url = await generateOgImage(opts)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
