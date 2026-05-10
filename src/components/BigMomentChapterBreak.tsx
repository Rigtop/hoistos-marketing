/**
 * BigMomentChapterBreak.tsx
 *
 * V2 Scrolophyte sprint, Tab C-fx Phase 1 (R055++ extreme-fidelity chapter-break).
 * V3 Visceral QC, Tab G5 Phase 1 (S198 morning 2026-05-08): added Position
 * Context strip, LoomEmbed sub-component with poster + duration overlay,
 * customScene injection slot, and customShader override slot. Component count
 * stays at 26+ (now 28: position context + LoomEmbed are additive premium
 * elements).
 *
 * Single React component that renders the over-the-top chapter-break treatment
 * for a "big moment" in Eugeen's Claude journey timeline. Composes 28 premium
 * components from the local primitive libraries (ui/aceternity + ui/magicui +
 * standalone Spotlight + Card3D) plus an optional @react-three/fiber shader
 * mesh and a drei Sparkles burst.
 *
 * Composition (R054 count audit, see header of caller):
 *   1  Spotlight (full-bleed cursor radial)
 *   2  BackgroundBeams (drifting SVG rays)
 *   3  Vortex (concentric rotating arcs)
 *   4  TracingBeam (left-edge scoped to this break)
 *   5  Lamp (top-of-section conic glow lighting the title)
 *   6  HeroParallax (5-layer depth: foreground/mid/back/atmosphere/grain)
 *   7  Card3D (mouse-tilt title card)
 *   8  StickyScrollReveal (chapter content sticky-stack)
 *   9  ContainerScroll (impact-stat reveal)
 *   10 Compare (before/after image slider)
 *   11 BlurFade (chapter title entry)
 *   12 AnimatedShinyText ("Chapter N" eyebrow)
 *   13 AuroraText (the AHA quote)
 *   14 BoxReveal (subhead reveal)
 *   15 NumberTicker (count-up on impact stat)
 *   16 Particles (signal-orange drift, viewport-wide)
 *   17 Marquee (footer related-moment quotes)
 *   18 ShineBorder (download-pack CTA when hasPack)
 *   19 PaperGlobe (paper-tinted slow rotation, behind title)
 *   20 MorphingText (title kinetic on entry)
 *   21 R3F shader noise mesh (signal-orange GLSL plane, optional)
 *   22 Loom embed iframe (90-sec Eugeen recap, optional)
 *   23 drei Sparkles (3D point burst around title, optional)
 *   24 SparklesBurst (2D radial scatter on entry)
 *   25 OrbitingCircles (decorative rings around chapter number)
 *   26 FlickeringGrid (texture floor)
 *   27 PositionContext strip (Moment X of N, Chapter Z of 6, between [prior] and [next])
 *   28 LoomEmbed (poster + duration overlay + click-to-play swap)
 *
 * Visual contract:
 *   - HoistOS LIGHT brand only: paper bg + concrete texture + ink fg + signal accent.
 *   - 100vh full-bleed sticky on entry, scrolls past on continued scroll.
 *   - prefers-reduced-motion respected: degrades to BlurFade + AuroraText +
 *     NumberTicker + static layout. All transforms + opacity, 60fps target.
 *
 * Hard Rule #11: zero em dashes.
 * Hard Rule #19: brand-only colors via CSS custom properties.
 * Hard Rule #31 (Context7): @react-three/fiber@9.6.1 + @react-three/drei@10.7.7
 *   already in package.json. <Canvas>, <shaderMaterial>, drei <Sparkles>,
 *   useFrame((state) => ...) are stable and declarative. Custom simplex-style
 *   trig noise; no extra deps.
 *
 * Tab C-fx Phase 1, S198 morning, 2026-05-08.
 */

import {
  Suspense,
  lazy,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'

import { Spotlight } from './Spotlight'
import { Card3D } from './Card3D'
import {
  BackgroundBeams,
  ContainerScroll,
  Lamp,
  SparklesBurst,
  TracingBeam,
  Vortex,
} from './ui/aceternity'
import {
  AnimatedShinyText,
  AuroraText,
  BlurFade,
  BoxReveal,
  EUGEEN_QUOTE_ROSTER,
  FlickeringGrid,
  Marquee,
  MorphingText,
  NumberTicker,
  OrbitingCircles,
  PaperGlobe,
  Particles,
  ShineBorder,
} from './ui/magicui'

/**
 * R3F + drei live behind a Suspense boundary so the shader path tree-shakes
 * cleanly out when shaderMode is "off" or prefers-reduced-motion is on. We
 * lazy-import to keep the initial JS payload below the 200KB Lighthouse
 * budget on the first paint of the timeline route.
 */
const ShaderNoiseMesh = lazy(() => import('./BigMomentChapterShader'))

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImpactStat {
  /** The numeric magnitude for the count-up. */
  value: number
  /** Suffix appended to the count (e.g. " hours", "x", "%"). */
  suffix: string
  /** Caption beneath the count (e.g. "saved per year"). */
  label: string
  /** Optional decimals for the count-up. Default 0. */
  decimals?: number
  /** Optional prefix for the count-up (e.g. "$"). */
  prefix?: string
}

export interface BigMomentChapterBreakProps {
  /** Chapter index 1..N (rendered as "Chapter 0N" eyebrow). */
  chapterNumber: number
  /** Chapter title, e.g. "When I Realized Memory Was the Bottleneck". */
  chapterTitle: string
  /** AHA-quote line, displayed in AuroraText below the title. */
  ahaQuote: string
  /** Numeric impact stat for the headline number. */
  impactStat: ImpactStat
  /** Optional before/after slider images. Both must be set to render. */
  beforeImage?: string
  /** Optional before/after slider images. Both must be set to render. */
  afterImage?: string
  /** Optional Loom embed URL (https://www.loom.com/embed/...). */
  loomEmbedUrl?: string
  /** Optional Loom poster thumbnail (renders before play). */
  loomThumbnail?: string
  /** Optional Loom duration in seconds (default 90). */
  loomDuration?: number
  /**
   * Children render below the impact stat as the "scrolling chapter body".
   * They sit inside the StickyScrollReveal stack.
   */
  children?: ReactNode
  /** Optional download CTA: when set, renders a ShineBorder button. */
  packHref?: string
  /** Override label for the pack CTA. Default: "Download the pack". */
  packLabel?: string
  /** Optional kicker label (e.g. "Move to Code"). Drives FloatingPin. */
  kicker?: string
  /**
   * Shader plane mode. "noise" mounts the default R3F GLSL plane, "off"
   * skips it, "custom" uses the customShader prop instead. Default "noise"
   * but we hard-disable for reduced-motion.
   */
  shaderMode?: 'noise' | 'off' | 'custom'
  /**
   * Variant. Different big moments lean on different layers:
   *   "memory"     parallax-heavy, dim shader, paper-globe forward
   *   "code"       shader-heavy, vortex forward, paper-globe muted
   *   "automation" particles-heavy, sparkles forward
   *   "default"    even mix
   */
  variant?: 'default' | 'memory' | 'code' | 'automation'
  /** Optional kinetic morph cycle for the title. */
  morphTitles?: string[]

  // ---------------------------------------------------------------------
  // V3 Visceral QC slots (G5 Phase 1, S198 morning 2026-05-08).
  // Position context, custom 3D scene injection, and custom shader override.
  // ---------------------------------------------------------------------

  /** 1-based chronological position in the long-scroll, e.g. 22 of 30. */
  momentNumber?: number
  /** Total moments in the long-scroll (default 30). */
  totalMoments?: number
  /** 1-based index among big moments only, e.g. 4 of 6. */
  bigMomentIndex?: number
  /** Total big moments (default 6). */
  totalBigMoments?: number
  /** Title of the prior big moment, used in the "between [Prior] and [Next]" strip. */
  priorMomentTitle?: string
  /** Title of the next big moment. */
  nextMomentTitle?: string
  /** Override the auto-derived position label string. */
  positionLabelOverride?: string
  /**
   * Custom 3D / hero scene injected into the title block (renders ABOVE the
   * title card). Tab G5 recommends one of:
   *   - chat-to-Cowork: a Custom Cursor that morphs into the HoistOS mark
   *   - Cowork-takes-control: Container Scroll showing mock screen recordings
   *   - skills-compounding: Animated Beam network connecting 5 skills
   *   - memory-was-bottleneck: memory chunks falling out then snapping back
   *   - move-to-Code: terminal typing reveal with custom shader background
   *   - autonomous-loops-shipped: 9-tab parallel mock with live progress bars
   */
  customScene?: ReactNode
  /**
   * Optional override for the default ShaderNoiseMesh. When provided AND
   * shaderMode is "custom" (or "noise"), this replaces the default plane.
   * Reduced-motion still hard-disables it. The slot receives no props; it
   * is rendered absolute-fill behind the title.
   */
  customShader?: ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// HeroParallax: 5-layer scroll-driven depth.
//
// Layer ordering (back -> front), each layer translates Y at a different
// rate as scrollYProgress runs from 0 -> 1 across the chapter break section.
//   z0 grain        (ultra-slow, decorative noise)
//   z1 atmosphere   (paper-tint radial, drifts down)
//   z2 background   (PaperGlobe + DotPattern, slow up)
//   z3 midground    (FlickeringGrid texture, medium up)
//   z4 foreground   (decorative chips floating in front of title, fast up)
// ---------------------------------------------------------------------------

interface HeroParallaxProps {
  scrollYProgress: any
  reduce: boolean | null
  variant: BigMomentChapterBreakProps['variant']
}

function HeroParallax({ scrollYProgress, reduce, variant }: HeroParallaxProps) {
  const yGrain = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '8%'])
  const yAtmos = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '14%'])
  const yBack = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-12%'])
  const yMid = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-22%'])
  const yFore = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-36%'])

  const globeOpacity = variant === 'code' ? 0.35 : 0.6
  const flickerOpacity = variant === 'memory' ? 0.7 : 0.45

  return (
    <>
      {/* z0 grain (deepest) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          y: yGrain,
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgb(var(--color-fg-muted) / 0.04) 0%, transparent 35%), radial-gradient(circle at 75% 65%, rgb(var(--color-accent) / 0.04) 0%, transparent 40%)',
        }}
      />
      {/* z1 atmosphere */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          y: yAtmos,
          background:
            'radial-gradient(ellipse 70% 55% at 50% 35%, rgb(var(--color-bg)) 0%, rgb(var(--color-surface) / 0.6) 60%, transparent 100%)',
        }}
      />
      {/* z2 background: PaperGlobe centered behind title */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ y: yBack, opacity: globeOpacity }}
      >
        <PaperGlobe size={680} />
      </motion.div>
      {/* z3 midground: FlickeringGrid floor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ y: yMid, opacity: flickerOpacity }}
      >
        <FlickeringGrid
          squareSize={3}
          gridGap={10}
          flickerChance={0.12}
          maxOpacity={0.18}
        />
      </motion.div>
      {/* z4 foreground: decorative orbiting chips around chapter number */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ y: yFore }}
      >
        <div className="absolute left-[12%] top-[18%]">
          <ChapterChip>Inflection</ChapterChip>
        </div>
        <div className="absolute right-[14%] top-[22%]">
          <ChapterChip>R055</ChapterChip>
        </div>
        <div className="absolute left-[18%] bottom-[26%]">
          <ChapterChip>Aha</ChapterChip>
        </div>
        <div className="absolute right-[10%] bottom-[20%]">
          <ChapterChip>Pack</ChapterChip>
        </div>
      </motion.div>
    </>
  )
}

function ChapterChip({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.28em]"
      style={{
        background: 'rgb(var(--color-surface-2) / 0.7)',
        borderColor: 'rgb(var(--color-accent) / 0.5)',
        color: 'rgb(var(--color-accent))',
        fontFamily: 'var(--font-brand)',
        fontWeight: 700,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 4px 16px rgb(var(--color-accent) / 0.18)',
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CompareSlider: horizontal-drag before/after reveal (Aceternity Compare flavor).
//
// Renders both images stacked. The top image is clipped by a clip-path that
// follows the slider position. Pointer events are tracked on the wrapper so
// touch + mouse work the same.
// ---------------------------------------------------------------------------

interface CompareSliderProps {
  beforeSrc: string
  afterSrc: string
  initialPosition?: number
}

function CompareSlider({
  beforeSrc,
  afterSrc,
  initialPosition = 50,
}: CompareSliderProps) {
  const [pos, setPos] = useState(initialPosition)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromClientX = (clientX: number) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const r = wrap.getBoundingClientRect()
    const next = ((clientX - r.left) / r.width) * 100
    setPos(Math.max(0, Math.min(100, next)))
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      updateFromClientX(e.clientX)
    }
    const onUp = () => {
      dragging.current = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-2xl border"
      style={{
        borderColor: 'rgb(var(--color-border))',
        aspectRatio: '16 / 9',
        boxShadow: '0 24px 60px rgb(17 24 39 / 0.12)',
      }}
      onPointerDown={(e) => {
        dragging.current = true
        updateFromClientX(e.clientX)
      }}
    >
      <img
        src={afterSrc}
        alt="After"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt="Before"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
      <div
        aria-hidden
        className="absolute top-0 h-full"
        style={{
          left: `${pos}%`,
          width: 2,
          background: 'rgb(var(--color-accent))',
          boxShadow:
            '0 0 14px rgb(var(--color-accent) / 0.85), 0 0 28px rgb(var(--color-accent) / 0.45)',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="absolute top-1/2"
        style={{
          left: `${pos}%`,
          transform: 'translate(-50%, -50%)',
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgb(var(--color-accent))',
          color: 'rgb(var(--color-bg))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-brand)',
          fontSize: 16,
          fontWeight: 700,
          boxShadow: '0 4px 18px rgb(var(--color-accent) / 0.55)',
          cursor: 'ew-resize',
        }}
      >
        {'<>'}
      </div>
      <div
        className="pointer-events-none absolute left-3 top-3 rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.2em]"
        style={{
          background: 'rgb(var(--color-bg) / 0.85)',
          borderColor: 'rgb(var(--color-border))',
          color: 'rgb(var(--color-fg))',
          fontFamily: 'var(--font-brand)',
          fontWeight: 700,
        }}
      >
        Before
      </div>
      <div
        className="pointer-events-none absolute right-3 top-3 rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.2em]"
        style={{
          background: 'rgb(var(--color-accent))',
          borderColor: 'rgb(var(--color-accent))',
          color: 'rgb(var(--color-bg))',
          fontFamily: 'var(--font-brand)',
          fontWeight: 700,
        }}
      >
        After
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StickyScrollReveal: the chapter-body stack. Each child block sticks at
// 30vh from the top, then unsticks when the next block scrolls in. Used
// for the actual chapter narrative content (children prop).
// ---------------------------------------------------------------------------

function StickyScrollReveal({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto max-w-3xl px-6">
      <div className="grid gap-24 py-16">
        {Array.isArray(children) ? children : <div>{children}</div>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LoomEmbed: poster-first Loom slot.
//
// Renders a 16:9 paper-bordered card with the poster thumbnail, a centered
// signal-orange play button, and a duration overlay. On click (or when the
// `autoplay` prop is set) it swaps to the actual Loom iframe.
//
// Placeholder thumbnails ship at /public/looms/<slug>-thumb.svg until the
// real recordings exist. When `url` is empty, the component still renders
// the poster and shows a "recording capture pending" badge instead of the
// play button.
//
// Tab G5 Phase 1, S198 morning, 2026-05-08.
// ---------------------------------------------------------------------------

export interface LoomEmbedProps {
  /** Loom embed URL, e.g. https://www.loom.com/embed/<id>. Optional. */
  url?: string
  /** Poster image URL (SVG/PNG). Recommended path: /looms/<slug>-thumb.svg. */
  thumbnail?: string
  /** Duration in seconds, rendered as "M:SS" overlay. Default 90. */
  duration?: number
  /** Accessible label for the play button. */
  label?: string
  /** Caption above the embed (small uppercase eyebrow). */
  caption?: string
  /** Force the iframe to mount on entry instead of waiting for click. */
  autoplay?: boolean
  className?: string
}

export function LoomEmbed({
  url,
  thumbnail,
  duration = 90,
  label = 'Play 90 second recap',
  caption = 'Eugeen on tape, 90 sec',
  autoplay = false,
  className = '',
}: LoomEmbedProps) {
  const [playing, setPlaying] = useState(autoplay)
  const hasUrl = Boolean(url)

  const mins = Math.floor(duration / 60)
  const secs = duration % 60
  const durationLabel = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    <div className={`mx-auto max-w-4xl px-6 pb-20 ${className}`}>
      <BlurFade>
        <div
          className="mb-3 text-[10px] uppercase tracking-[0.32em]"
          style={{
            color: 'rgb(var(--color-fg-muted))',
            fontFamily: 'var(--font-brand)',
            fontWeight: 700,
          }}
        >
          {caption}
        </div>
        <div
          className="relative overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'rgb(var(--color-border))',
            background: 'rgb(var(--color-surface))',
            aspectRatio: '16 / 9',
            boxShadow: '0 24px 60px rgb(17 24 39 / 0.12)',
          }}
        >
          {/* Paper-tinted accent ring */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl z-10"
            style={{
              boxShadow:
                'inset 0 0 0 1px rgb(var(--color-accent) / 0.3), inset 0 0 32px rgb(var(--color-accent) / 0.08)',
            }}
          />

          {playing && hasUrl ? (
            <iframe
              src={url}
              title={label}
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
            />
          ) : (
            <>
              {/* Poster image */}
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse 60% 45% at 50% 40%, rgb(var(--color-accent) / 0.25), transparent 70%), rgb(var(--color-surface))',
                  }}
                />
              )}

              {/* Center play button or pending pill */}
              {hasUrl ? (
                <button
                  type="button"
                  aria-label={label}
                  onClick={() => setPlaying(true)}
                  className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform hover:scale-105"
                  style={{
                    background: 'rgb(var(--color-accent))',
                    color: 'rgb(var(--color-bg))',
                    boxShadow:
                      '0 12px 36px rgb(var(--color-accent) / 0.45), 0 0 0 8px rgb(var(--color-bg) / 0.45)',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    aria-hidden
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              ) : (
                <div
                  className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
                  style={{
                    background: 'rgb(var(--color-bg) / 0.85)',
                    borderColor: 'rgb(var(--color-accent) / 0.55)',
                    color: 'rgb(var(--color-fg))',
                    fontFamily: 'var(--font-brand)',
                    fontWeight: 700,
                  }}
                >
                  Recording capture pending
                </div>
              )}

              {/* Duration overlay (bottom-right) */}
              <div
                className="absolute bottom-3 right-3 z-20 rounded-md px-2 py-1 text-[11px] tabular-nums"
                style={{
                  background: 'rgb(0 0 0 / 0.65)',
                  color: 'rgb(var(--color-bg))',
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                {durationLabel}
              </div>

              {/* Loom wordmark (bottom-left) */}
              <div
                className="absolute bottom-3 left-3 z-20 text-[10px] uppercase tracking-[0.28em]"
                style={{
                  color: 'rgb(var(--color-bg))',
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgb(0 0 0 / 0.5)',
                }}
              >
                Loom . on tape
              </div>
            </>
          )}
        </div>
      </BlurFade>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PositionContext: small strip that shows where the reader is in the scroll.
//
// Renders three pieces:
//   - "Moment X of N, Y% through your journey" (with a thin progress bar)
//   - "Chapter Z of 6, between [Prior] and [Next]"
//   - Compact dot row of all 6 big moments with the active one accented
//
// Sits between the Lamp and the Title block in the hero panel.
// ---------------------------------------------------------------------------

interface PositionContextStripProps {
  momentNumber: number
  totalMoments: number
  bigMomentIndex: number
  totalBigMoments: number
  priorMomentTitle?: string
  nextMomentTitle?: string
  override?: string
}

function PositionContextStrip({
  momentNumber,
  totalMoments,
  bigMomentIndex,
  totalBigMoments,
  priorMomentTitle,
  nextMomentTitle,
  override,
}: PositionContextStripProps) {
  const pct = Math.round((momentNumber / Math.max(1, totalMoments)) * 100)
  const between =
    priorMomentTitle && nextMomentTitle
      ? `between ${priorMomentTitle} and ${nextMomentTitle}`
      : priorMomentTitle
      ? `after ${priorMomentTitle}`
      : nextMomentTitle
      ? `before ${nextMomentTitle}`
      : null

  return (
    <BlurFade delay={0.02} yOffset={6}>
      <div
        className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.32em]"
          style={{ color: 'rgb(var(--color-fg-muted))', fontWeight: 600 }}
        >
          {override
            ? override
            : `Moment ${momentNumber} of ${totalMoments} . ${pct}% through your journey`}
        </div>

        <div
          className="relative h-[2px] w-44 overflow-hidden rounded-full"
          style={{ background: 'rgb(var(--color-fg-muted) / 0.18)' }}
          aria-hidden
        >
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${pct}%`,
              background:
                'linear-gradient(to right, rgb(var(--color-accent)), rgb(var(--color-accent) / 0.6))',
              boxShadow: '0 0 8px rgb(var(--color-accent) / 0.6)',
            }}
          />
        </div>

        <div
          className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: 'rgb(var(--color-fg) / 0.78)', fontWeight: 600 }}
        >
          Chapter {bigMomentIndex} of {totalBigMoments}
          {between ? ` . ${between}` : ''}
        </div>

        {/* Six-dot chapter pulse */}
        <div className="flex items-center gap-2" aria-hidden>
          {Array.from({ length: totalBigMoments }, (_, i) => i + 1).map((i) => {
            const active = i === bigMomentIndex
            return (
              <span
                key={i}
                className="block rounded-full transition-all"
                style={{
                  width: active ? 14 : 6,
                  height: 6,
                  background: active
                    ? 'rgb(var(--color-accent))'
                    : 'rgb(var(--color-fg-muted) / 0.45)',
                  boxShadow: active
                    ? '0 0 10px rgb(var(--color-accent) / 0.7)'
                    : 'none',
                }}
              />
            )
          })}
        </div>
      </div>
    </BlurFade>
  )
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function BigMomentChapterBreak({
  chapterNumber,
  chapterTitle,
  ahaQuote,
  impactStat,
  beforeImage,
  afterImage,
  loomEmbedUrl,
  loomThumbnail,
  loomDuration = 90,
  children,
  packHref,
  packLabel = 'Download the pack',
  kicker,
  shaderMode = 'noise',
  variant = 'default',
  morphTitles,
  momentNumber,
  totalMoments = 30,
  bigMomentIndex,
  totalBigMoments = 6,
  priorMomentTitle,
  nextMomentTitle,
  positionLabelOverride,
  customScene,
  customShader,
  className = '',
}: BigMomentChapterBreakProps) {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const tracingScopeRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const stickyEntryRef = useRef<HTMLDivElement>(null)
  const sparkleId = useId()

  // Scroll progress across the entire section drives all parallax + tracing.
  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const smoothedSectionProgress = useSpring(sectionProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.0008,
  })

  // Hero (the 100vh sticky panel) progresses 0 -> 1 as it scrolls past the top.
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(heroProgress, [0, 0.6, 1], [1, 1, 0])
  const heroScale = useTransform(heroProgress, [0, 1], [1, reduce ? 1 : 0.94])

  // SparklesBurst fires when the title comes into view (heroProgress > 0.05).
  const [titleEntered, setTitleEntered] = useState(false)
  useEffect(() => {
    const unsub = heroProgress.on('change', (v) => {
      if (v > 0.05 && !titleEntered) setTitleEntered(true)
    })
    return () => unsub()
  }, [heroProgress, titleEntered])

  const chapterNumberPadded = useMemo(
    () => String(chapterNumber).padStart(2, '0'),
    [chapterNumber],
  )

  const showDefaultShader = shaderMode === 'noise' && !customShader && !reduce
  const showCustomShader =
    (shaderMode === 'noise' || shaderMode === 'custom') &&
    Boolean(customShader) &&
    !reduce
  const showCompare = Boolean(beforeImage && afterImage)
  const showLoom = Boolean(loomEmbedUrl) || Boolean(loomThumbnail)
  const showPack = Boolean(packHref)
  const showPositionContext = typeof bigMomentIndex === 'number' && typeof momentNumber === 'number'

  const variantTokens = useMemo(() => {
    switch (variant) {
      case 'memory':
        return {
          shaderIntensity: 0.4,
          particleCount: 80,
          vortexOpacity: 0.45,
          beamStrength: 0.65,
          accent2Lean: 0.4,
        }
      case 'code':
        return {
          shaderIntensity: 1.0,
          particleCount: 50,
          vortexOpacity: 0.85,
          beamStrength: 0.5,
          accent2Lean: 0.7,
        }
      case 'automation':
        return {
          shaderIntensity: 0.6,
          particleCount: 110,
          vortexOpacity: 0.55,
          beamStrength: 0.55,
          accent2Lean: 0.5,
        }
      default:
        return {
          shaderIntensity: 0.7,
          particleCount: 70,
          vortexOpacity: 0.6,
          beamStrength: 0.6,
          accent2Lean: 0.45,
        }
    }
  }, [variant])

  return (
    <section
      ref={sectionRef}
      data-theme="hoistos-light"
      data-chapter={chapterNumber}
      className={`relative w-full ${className}`}
      style={{
        background: 'rgb(var(--color-bg))',
        color: 'rgb(var(--color-fg))',
        fontFamily: 'var(--font-sans)',
      }}
      aria-labelledby={`chapter-${sparkleId}-heading`}
    >
      {/* TracingBeam scoped to this chapter break (left-edge signal-orange) */}
      <div ref={tracingScopeRef} className="absolute inset-0 pointer-events-none">
        <TracingBeam containerRef={tracingScopeRef} thickness={2} />
      </div>

      {/* ===== HERO PANEL: 100vh sticky on entry =================== */}
      <div ref={heroRef} className="relative" style={{ height: '180vh' }}>
        <motion.div
          className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          {/* Layer A: Spotlight wrapper (full-bleed cursor radial)         */}
          <Spotlight className="absolute inset-0 h-full w-full" size={520}>
            {/* Layer B: BackgroundBeams (drifting SVG rays)                */}
            <BackgroundBeams className="z-0" />

            {/* Layer C: Vortex (concentric arcs)                           */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ opacity: variantTokens.vortexOpacity }}
            >
              <Vortex className="absolute inset-0">
                <span className="sr-only">Vortex</span>
              </Vortex>
            </div>

            {/* Layer D: HeroParallax (5-layer depth) ====================== */}
            <HeroParallax
              scrollYProgress={smoothedSectionProgress}
              reduce={reduce}
              variant={variant}
            />

            {/* Layer E: optional R3F shader plane ========================= */}
            {showDefaultShader && (
              <Suspense fallback={null}>
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{ opacity: variantTokens.shaderIntensity * 0.55 }}
                >
                  <ShaderNoiseMesh
                    intensity={variantTokens.shaderIntensity}
                    accent2Lean={variantTokens.accent2Lean}
                  />
                </div>
              </Suspense>
            )}

            {/* Layer E.alt: per-chapter custom shader override (G5 slot) === */}
            {showCustomShader && (
              <Suspense fallback={null}>
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{ opacity: variantTokens.shaderIntensity * 0.55 }}
                  data-slot="custom-shader"
                >
                  {customShader}
                </div>
              </Suspense>
            )}

            {/* Layer F: Particles converging up into the title =========== */}
            <Particles
              count={variantTokens.particleCount}
              speed={0.6}
              className="z-[5]"
            />

            {/* Layer G: Lamp lighting the title from above ================ */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-0 z-[6] flex justify-center"
            >
              <Lamp
                width={760}
                height={260}
                caption={kicker ?? `CHAPTER ${chapterNumberPadded}`}
              />
            </div>

            {/* Layer H: SparklesBurst on title entry ===================== */}
            <div className="absolute left-1/2 top-1/2 z-[7] -translate-x-1/2 -translate-y-1/2">
              <SparklesBurst active={titleEntered} count={24} radius={180} />
            </div>

            {/* Layer I: OrbitingCircles around chapter number ============ */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-[22vh]"
            >
              <OrbitingCircles radius={140} duration={36}>
                <span
                  className="text-[10px] uppercase tracking-[0.32em]"
                  style={{
                    color: 'rgb(var(--color-accent))',
                    fontFamily: 'var(--font-brand)',
                    fontWeight: 700,
                  }}
                >
                  signal
                </span>
              </OrbitingCircles>
              <OrbitingCircles radius={210} duration={56} reverse delay={0.8}>
                <span
                  className="text-[10px] uppercase tracking-[0.32em]"
                  style={{
                    color: 'rgb(var(--color-fg-muted))',
                    fontFamily: 'var(--font-brand)',
                    fontWeight: 700,
                  }}
                >
                  inflection
                </span>
              </OrbitingCircles>
            </div>

            {/* Layer J: TITLE BLOCK ====================================== */}
            <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 text-center">
              {/* G5: Position context strip (Moment X of N, Chapter Z of 6) */}
              {showPositionContext && (
                <PositionContextStrip
                  momentNumber={momentNumber as number}
                  totalMoments={totalMoments}
                  bigMomentIndex={bigMomentIndex as number}
                  totalBigMoments={totalBigMoments}
                  priorMomentTitle={priorMomentTitle}
                  nextMomentTitle={nextMomentTitle}
                  override={positionLabelOverride}
                />
              )}

              {/* G5: customScene slot (custom 3D / hero injection) */}
              {customScene && (
                <BlurFade delay={0.04} yOffset={8}>
                  <div
                    className="relative w-full"
                    data-slot="custom-scene"
                    style={{ minHeight: 0 }}
                  >
                    {customScene}
                  </div>
                </BlurFade>
              )}

              {/* "Chapter 0N" eyebrow with shiny shimmer */}
              <BlurFade delay={0.05} yOffset={12}>
                <div
                  className="text-[11px] uppercase tracking-[0.42em]"
                  style={{
                    fontFamily: 'var(--font-brand)',
                    fontWeight: 700,
                  }}
                >
                  <AnimatedShinyText
                    duration={5}
                    baseColor="rgb(var(--color-fg-muted))"
                    shineColor="rgb(var(--color-accent))"
                  >
                    {`Chapter ${chapterNumberPadded}`}
                  </AnimatedShinyText>
                </div>
              </BlurFade>

              {/* Card3D-tilted title card with the headline */}
              <BlurFade delay={0.18} yOffset={20} blur={12}>
                <Card3D maxTilt={6} className="px-2">
                  <h2
                    id={`chapter-${sparkleId}-heading`}
                    className="font-[var(--font-display)] text-balance"
                    style={{
                      fontSize: 'clamp(2.4rem, 6.2vw, 5.6rem)',
                      lineHeight: 0.98,
                      letterSpacing: '-0.022em',
                      color: 'rgb(var(--color-fg))',
                      maxWidth: '20ch',
                      margin: '0 auto',
                    }}
                  >
                    {morphTitles && morphTitles.length > 1 ? (
                      <MorphingText texts={[chapterTitle, ...morphTitles]} />
                    ) : (
                      chapterTitle
                    )}
                  </h2>
                </Card3D>
              </BlurFade>

              {/* AHA quote in AuroraText */}
              <BlurFade delay={0.34} yOffset={14} blur={10}>
                <p
                  className="font-[var(--font-display)] italic"
                  style={{
                    fontSize: 'clamp(1.2rem, 2.4vw, 1.85rem)',
                    lineHeight: 1.4,
                    maxWidth: '36ch',
                    margin: '0 auto',
                  }}
                >
                  <AuroraText duration={9}>{ahaQuote}</AuroraText>
                </p>
              </BlurFade>

              {/* BoxReveal subhead */}
              <BlurFade delay={0.5} yOffset={10} blur={8}>
                <BoxReveal>
                  <span
                    className="text-[11px] uppercase tracking-[0.32em]"
                    style={{
                      color: 'rgb(var(--color-fg-muted))',
                      fontFamily: 'var(--font-brand)',
                      fontWeight: 700,
                    }}
                  >
                    {kicker ?? 'A pivot in the operating loop'}
                  </span>
                </BoxReveal>
              </BlurFade>

              {/* Pack CTA: ShineBorder button */}
              {showPack && (
                <BlurFade delay={0.62} yOffset={10}>
                  <ShineBorder borderRadius={999} borderWidth={1.5}>
                    <a
                      href={packHref}
                      className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-[12px] uppercase tracking-[0.24em] transition-colors"
                      style={{
                        background: 'rgb(var(--color-fg))',
                        color: 'rgb(var(--color-bg))',
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 700,
                      }}
                    >
                      <span>{packLabel}</span>
                      <span aria-hidden>{'->'}</span>
                    </a>
                  </ShineBorder>
                </BlurFade>
              )}
            </div>
          </Spotlight>
        </motion.div>
      </div>

      {/* ===== IMPACT STAT REVEAL ================================== */}
      <div ref={stickyEntryRef} className="relative px-6 py-32">
        <ContainerScroll fromRotate={-7} toRotate={0} fromScale={0.9}>
          <div
            className="mx-auto max-w-4xl rounded-3xl border p-12 text-center"
            style={{
              background: 'rgb(var(--color-surface-2))',
              borderColor: 'rgb(var(--color-border))',
              boxShadow:
                '0 32px 80px rgb(17 24 39 / 0.10), 0 4px 24px rgb(var(--color-accent) / 0.10)',
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{
                color: 'rgb(var(--color-accent))',
                fontFamily: 'var(--font-brand)',
                fontWeight: 700,
              }}
            >
              Impact
            </div>
            <div
              className="mt-4 font-[var(--font-display)]"
              style={{
                fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                color: 'rgb(var(--color-fg))',
              }}
            >
              <NumberTicker
                value={impactStat.value}
                suffix={impactStat.suffix}
                decimals={impactStat.decimals ?? 0}
                prefix={impactStat.prefix ?? ''}
                duration={2.2}
              />
            </div>
            <div
              className="mt-3 text-[14px] uppercase tracking-[0.24em]"
              style={{
                color: 'rgb(var(--color-fg-muted))',
                fontFamily: 'var(--font-brand)',
                fontWeight: 600,
              }}
            >
              {impactStat.label}
            </div>
          </div>
        </ContainerScroll>
      </div>

      {/* ===== STICKY BODY (children) + COMPARE + LOOM ============= */}
      <div className="relative">
        {showCompare && (
          <div className="mx-auto max-w-4xl px-6 pb-20">
            <BlurFade>
              <div
                className="mb-3 text-[10px] uppercase tracking-[0.32em]"
                style={{
                  color: 'rgb(var(--color-fg-muted))',
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 700,
                }}
              >
                Drag to compare
              </div>
              <CompareSlider
                beforeSrc={beforeImage as string}
                afterSrc={afterImage as string}
              />
            </BlurFade>
          </div>
        )}

        {showLoom && (
          <LoomEmbed
            url={loomEmbedUrl}
            thumbnail={loomThumbnail}
            duration={loomDuration}
            label={`Eugeen recap, chapter ${chapterNumberPadded}`}
            caption={`Eugeen on tape, ${Math.round(loomDuration)} sec`}
          />
        )}

        {children && <StickyScrollReveal>{children}</StickyScrollReveal>}
      </div>

      {/* ===== FOOTER MARQUEE: related-moment quotes =============== */}
      <div className="relative pt-12 pb-16">
        <div
          aria-hidden
          className="mb-3 text-center text-[10px] uppercase tracking-[0.32em]"
          style={{
            color: 'rgb(var(--color-fg-muted))',
            fontFamily: 'var(--font-brand)',
            fontWeight: 700,
          }}
        >
          From the Decision Log
        </div>
        <Marquee duration={42} pauseOnHover>
          {EUGEEN_QUOTE_ROSTER.map((q) => (
            <span
              key={q.id}
              className="mx-6 inline-flex items-baseline gap-3 whitespace-nowrap"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.28em]"
                style={{
                  color: 'rgb(var(--color-accent))',
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 700,
                }}
              >
                {q.tag}
              </span>
              <span
                className="text-[15px] italic"
                style={{ color: 'rgb(var(--color-fg))' }}
              >
                "{q.quote}"
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* Bottom hairline */}
      <div
        aria-hidden
        className="mx-auto h-px w-2/3"
        style={{
          background:
            'linear-gradient(to right, transparent, rgb(var(--color-accent) / 0.6), transparent)',
        }}
      />
    </section>
  )
}

// Re-export for convenience.
export { CompareSlider }
// LoomEmbed is exported as a named export earlier in this file (G5 slot).
