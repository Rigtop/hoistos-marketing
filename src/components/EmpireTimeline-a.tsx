/**
 * EmpireTimeline-a (Treatment A): Pudding-style + Apple Watch Series 7 vertical
 * chronological scrollytelling.
 *
 * B2 Phase 2, S197 night, 2026-05-07. Spec: ../../empire/content/types.ts +
 * /Users/eugeenbernan/Desktop/Outputs/AI Systems/Strategy/empire-wireframe/artifacts/B2/phase-1-spec.md.
 *
 * Layout:
 *   1. Hero (sticky 100vh): HoistOS mark + serif display headline + Inter subhead
 *      + scroll-arrow CTA. Aceternity-style spotlight, signal orange on paper.
 *   2. Per AhaMoment: 200vh container, 100vh sticky inner. LEFT col 40% holds
 *      AhaCard text (hook, before, after, efficiency, foundation). RIGHT col
 *      60% sticks and runs a BEFORE -> AHA flash -> AFTER state machine driven
 *      by Motion useScroll progress.
 *   3. Vertical scroll-progress rail on right edge, one dot per moment.
 *      Active dot grows + fills signal accent. Thin signal connector line
 *      between dots, GSAP ScrollTrigger draws it as the user scrolls.
 *   4. Final CTA section: "explore the full dependency graph" -> ?treatment=c.
 *
 * Hard Rule #11: zero em dashes in this file. Hard Rule #31: Context7
 * disclosures emitted before write (motion, gsap, lenis, lucide).
 */

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  type CSSProperties,
} from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  type MotionValue,
} from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowDown,
  Lightbulb,
  Sparkles,
  Network,
  Wrench,
  ArrowRight,
  Cpu,
  Layers,
  Compass,
} from 'lucide-react'

import {
  CATEGORY_ACCENT,
  MOCK_AHA_MOMENTS,
  type AhaMoment,
  type AhaIconKind,
  type AhaCategory,
} from '../empire/content/types'

import {
  TracingBeam,
  Lamp,
  Vortex,
  FloatingDock,
  ContainerScroll,
  SparklesBurst,
  type DockItem,
} from './ui/aceternity'
import {
  NumberTicker,
  Marquee,
  AuroraText,
  AnimatedShinyText,
  MorphingText,
  BlurFade,
  ShineBorder,
  DotPattern,
  GridPattern,
  AnimatedGradientText,
  EUGEEN_QUOTE_ROSTER,
} from './ui/magicui'
import { ScrollProgressBar } from './ScrollProgressBar'

gsap.registerPlugin(ScrollTrigger)

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

export interface EmpireTimelineAProps {
  /** Aha moments to render. Falls back to MOCK_AHA_MOMENTS when omitted. */
  moments?: AhaMoment[]
  /** Brand wordmark text in hero. */
  brandMark?: string
  /** Display headline in hero (DM Serif Display). */
  headline?: string
  /** Inter subhead in hero. */
  subhead?: string
  /** Where the final CTA sends the user. Default ?treatment=c. */
  exploreHref?: string
  /** className override on the outer wrapper. */
  className?: string
}

// ---------------------------------------------------------------------------
// Default export: EmpireTimelineA
// ---------------------------------------------------------------------------

export default function EmpireTimelineA({
  moments = MOCK_AHA_MOMENTS,
  brandMark = 'HoistOS',
  headline = 'How Eugeen rebuilt his operating system',
  subhead = 'Seven aha moments, one continuous scroll. Each one foundational to the next.',
  exploreHref = '?treatment=c',
  className = '',
}: EmpireTimelineAProps) {
  const sortedMoments = useMemo(
    () =>
      [...moments].sort((a, b) =>
        a.dateShipped.localeCompare(b.dateShipped),
      ),
    [moments],
  )
  const [activeId, setActiveId] = useState<string>(sortedMoments[0]?.id ?? '')
  const containerRef = useRef<HTMLDivElement>(null)

  // Group moments into "acts" by category transitions so we can drop a Lamp
  // between every category change. This is the "new act" signal Eugeen wants.
  const actMarkers = useMemo(() => {
    const out: { afterIndex: number; category: AhaCategory }[] = []
    for (let i = 1; i < sortedMoments.length; i++) {
      if (sortedMoments[i].category !== sortedMoments[i - 1].category) {
        out.push({ afterIndex: i - 1, category: sortedMoments[i].category })
      }
    }
    return out
  }, [sortedMoments])

  function jumpTo(id: string) {
    const target = document.querySelector(`[data-aha-id="${id}"]`) as HTMLElement | null
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const dockItems: DockItem[] = useMemo(() => [
    {
      id: 'a',
      label: 'Vertical scroll (this)',
      icon: <Layers size={18} />,
      active: true,
      href: '?treatment=a',
    },
    {
      id: 'b',
      label: 'Keynote tunnel (3D)',
      icon: <Cpu size={18} />,
      href: '?treatment=b',
    },
    {
      id: 'c',
      label: 'Dependency graph',
      icon: <Network size={18} />,
      href: '?treatment=c',
    },
    {
      id: 'top',
      label: 'Top',
      icon: <Compass size={18} />,
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
  ], [])

  return (
    <div
      ref={containerRef}
      data-theme="hoistos-light"
      className={`relative min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] ${className}`}
    >
      {/* Top-of-page scroll progress bar (Magic UI) */}
      <ScrollProgressBar position="top" height={2} />

      {/* Tracing beam down the LEFT edge (Aceternity) */}
      <TracingBeam color="rgb(var(--color-accent))" thickness={2} leftOffset={28} />

      {/* Floating dock for treatment switcher (Aceternity) */}
      <FloatingDock items={dockItems} />

      {/* Floating navbar that condenses on scroll */}
      <FloatingNavbar
        brandMark={brandMark}
        moments={sortedMoments}
        activeId={activeId}
        onJump={jumpTo}
      />

      <HeroSection
        brandMark={brandMark}
        headline={headline}
        subhead={subhead}
      />

      <ScrollProgressRail
        moments={sortedMoments}
        activeId={activeId}
      />

      <main className="relative">
        {sortedMoments.map((moment, idx) => {
          const lampHere = actMarkers.find((m) => m.afterIndex === idx - 1)
          return (
            <div key={moment.id}>
              {lampHere && (
                <Lamp
                  caption={`Next act: ${lampHere.category}`}
                  color={CATEGORY_ACCENT[lampHere.category]}
                />
              )}
              <AhaSection
                moment={moment}
                index={idx}
                total={sortedMoments.length}
                onActivate={setActiveId}
              />
            </div>
          )
        })}
      </main>

      <QuoteMarqueeRail />

      <FinalCtaSection exploreHref={exploreHref} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// FloatingNavbar: condenses on scroll, shows current section + jump-to chips.
// ---------------------------------------------------------------------------

interface FloatingNavbarProps {
  brandMark: string
  moments: AhaMoment[]
  activeId: string
  onJump: (id: string) => void
}

function FloatingNavbar({ brandMark, moments, activeId, onJump }: FloatingNavbarProps) {
  const [condensed, setCondensed] = useState(false)
  useEffect(() => {
    function onScroll() {
      setCondensed(window.scrollY > 200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeIdx = moments.findIndex((m) => m.id === activeId)
  const activeMoment = moments[activeIdx]

  return (
    <motion.nav
      initial={{ y: -32, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        scale: condensed ? 0.96 : 1,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="pointer-events-none fixed left-1/2 top-4 z-40 -translate-x-1/2"
      aria-label="Empire timeline navigation"
    >
      <motion.div
        animate={{
          paddingLeft: condensed ? 12 : 18,
          paddingRight: condensed ? 12 : 18,
          paddingTop: condensed ? 6 : 10,
          paddingBottom: condensed ? 6 : 10,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex items-center gap-3 rounded-full border"
        style={{
          background: 'rgba(255, 255, 255, 0.86)',
          borderColor: 'rgb(var(--color-border))',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: condensed
            ? '0 6px 24px rgba(17, 24, 39, 0.08)'
            : '0 2px 8px rgba(17, 24, 39, 0.04)',
        }}
      >
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-[rgb(var(--color-accent))]"
        />
        <span
          className="text-[12px] tracking-[0.04em]"
          style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}
        >
          {brandMark}
        </span>
        <span className="h-3 w-px bg-[rgb(var(--color-border))]" aria-hidden />
        <AnimatePresence mode="wait">
          {activeMoment && (
            <motion.span
              key={activeMoment.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="hidden text-[11px] uppercase tracking-[0.18em] sm:inline"
              style={{
                color: 'rgb(var(--color-fg-muted))',
                fontFamily: 'var(--font-brand)',
              }}
            >
              {String(activeIdx + 1).padStart(2, '0')} / {activeMoment.title}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="h-3 w-px bg-[rgb(var(--color-border))]" aria-hidden />
        <div className="flex items-center gap-1">
          {moments.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onJump(m.id)}
              aria-label={`Jump to ${m.title}`}
              className="group h-1.5 rounded-full transition-all"
              style={{
                width: m.id === activeId ? 18 : 6,
                background:
                  m.id === activeId
                    ? CATEGORY_ACCENT[m.category]
                    : 'rgb(var(--color-fg-subtle) / 0.5)',
              }}
            >
              <span className="sr-only">{i + 1}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  )
}

// ---------------------------------------------------------------------------
// QuoteMarqueeRail: rotating Eugeen quotes from the Decision Log roster
// ---------------------------------------------------------------------------

function QuoteMarqueeRail() {
  return (
    <section
      aria-label="Eugeen quote rail"
      className="relative w-full border-y py-6"
      style={{
        borderColor: 'rgb(var(--color-border))',
        background:
          'linear-gradient(to right, rgb(var(--color-surface)), rgb(var(--color-bg)) 30%, rgb(var(--color-bg)) 70%, rgb(var(--color-surface)))',
      }}
    >
      <Marquee duration={48}>
        {EUGEEN_QUOTE_ROSTER.map((q) => (
          <div
            key={q.id}
            className="inline-flex items-center gap-3 px-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{
                color: 'rgb(var(--color-accent))',
                fontFamily: 'var(--font-brand)',
                fontWeight: 700,
              }}
            >
              {q.tag}
            </span>
            <span className="text-[18px] italic text-[rgb(var(--color-fg))]">
              "{q.quote}"
            </span>
            <span
              aria-hidden
              className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-accent))]"
            />
          </div>
        ))}
      </Marquee>
    </section>
  )
}

// ---------------------------------------------------------------------------
// HeroSection: sticky 100vh full-bleed, Aceternity spotlight, BlurFade entry
// ---------------------------------------------------------------------------

interface HeroSectionProps {
  brandMark: string
  headline: string
  subhead: string
}

export function HeroSection({ brandMark, headline, subhead }: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <section
      ref={ref}
      className="relative h-[100vh] w-full overflow-hidden"
      aria-label="Empire timeline hero"
    >
      {/* Layered background: spotlight + dot pattern + grid + animated beams */}
      <AceternitySpotlight />
      <DotPattern dotSize={1} spacing={28} opacity={0.10} />
      <HeroBackgroundBeams />

      <div className="relative z-10 flex h-full flex-col items-start justify-center px-8 sm:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-6 flex items-center gap-3"
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full bg-[rgb(var(--color-accent))]"
            style={{
              boxShadow: '0 0 12px rgb(var(--color-accent)), 0 0 32px rgb(var(--color-accent) / 0.5)',
            }}
          />
          <AnimatedShinyText className="text-xs uppercase tracking-[0.2em]">
            <span style={{ fontFamily: 'var(--font-brand)' }}>
              {brandMark} / Empire timeline / S197 / aha cards
            </span>
          </AnimatedShinyText>
        </motion.div>

        <motion.h1
          style={{
            y: headlineY,
            opacity: headlineOpacity,
            fontFamily: 'var(--font-display)',
          }}
          className="max-w-5xl text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.05] tracking-tight"
        >
          <ShinyHeadline text={headline} />
        </motion.h1>

        <BlurFade delay={0.5} duration={0.9} className="mt-8 max-w-2xl">
          <p className="text-lg leading-relaxed text-[rgb(var(--color-fg-muted))]">
            {subhead}
          </p>
          <div className="mt-3 flex items-center gap-3 text-sm text-[rgb(var(--color-fg-muted))]">
            <span
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: 'rgb(var(--color-accent))', fontFamily: 'var(--font-brand)', fontWeight: 700 }}
            >
              Scroll to explore
            </span>
            <span aria-hidden className="h-px w-12 bg-[rgb(var(--color-border))]" />
            <MorphingText
              texts={[
                'identity drift to under 1 per week',
                '45 skills, 9 autonomous',
                '3 surfaces, one brain',
                'answer accuracy 30% to 85%',
                'session re-orientation 20m to 2m',
              ]}
              interval={2400}
              className="italic"
            />
          </div>
        </BlurFade>

        <motion.div
          style={{ opacity: arrowOpacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[rgb(var(--color-fg-muted))]"
        >
          <span className="text-xs uppercase tracking-[0.18em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={20} className="text-[rgb(var(--color-accent))]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Local hero beams: SVG curves drifting across the hero. Cheap, on-brand.
function HeroBackgroundBeams() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 1200 800"
    >
      <defs>
        <linearGradient id="hero-beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(242, 90, 0)" stopOpacity="0" />
          <stop offset="50%" stopColor="rgb(242, 90, 0)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="rgb(242, 90, 0)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 6 }).map((_, i) => {
        const y = 80 + i * 120
        const dur = 8 + i * 1.2
        return (
          <motion.path
            key={i}
            d={`M -100 ${y} Q 600 ${y + (i % 2 === 0 ? 60 : -60)}, 1300 ${y + (i % 2 === 0 ? 30 : -30)}`}
            stroke="url(#hero-beam-grad)"
            strokeWidth={i % 2 === 0 ? 1.4 : 0.8}
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{
              duration: dur,
              delay: i * 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </svg>
  )
}

/**
 * Aceternity-flavored spotlight: a large blurred SVG ellipse fixed in the
 * upper-left, plus a paper-warm radial gradient. Reads "warm" against the
 * white paper background. Decorative only, not interactive.
 */
function AceternitySpotlight() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 18% 28%, rgb(var(--color-accent) / 0.18) 0%, rgb(var(--color-accent) / 0.04) 35%, transparent 70%)',
        }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[120vh] w-[80vw] opacity-70"
        viewBox="0 0 800 800"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="empire-spotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(242, 90, 0)" stopOpacity="0.35" />
            <stop offset="40%" stopColor="rgb(255, 138, 61)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="rgb(255, 138, 61)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="400"
          cy="400"
          rx="380"
          ry="260"
          fill="url(#empire-spotlight)"
          transform="rotate(-18 400 400)"
        />
      </svg>

      {/* Hairline grid texture, very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--color-fg)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-fg)) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </>
  )
}

/**
 * AnimatedShinyText-style headline: word-by-word BlurFade reveal with a
 * traveling shimmer. Magic UI inspired, hand-rolled to avoid an extra dep.
 */
function ShinyHeadline({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <span
      className="relative inline-block bg-clip-text"
      style={{
        backgroundImage:
          'linear-gradient(110deg, rgb(var(--color-fg)) 0%, rgb(var(--color-fg)) 45%, rgb(var(--color-accent)) 50%, rgb(var(--color-fg)) 55%, rgb(var(--color-fg)) 100%)',
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'empire-shimmer 6s ease-in-out infinite',
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, filter: 'blur(12px)', y: 8 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
          className="inline-block"
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
      <style>{`
        @keyframes empire-shimmer {
          0%, 100% { background-position: 200% 50%; }
          50% { background-position: 0% 50%; }
        }
      `}</style>
    </span>
  )
}

// ---------------------------------------------------------------------------
// AhaSection: 200vh container, 100vh sticky inner, 2-col 40/60 layout
// ---------------------------------------------------------------------------

interface AhaSectionProps {
  moment: AhaMoment
  index: number
  total: number
  onActivate: (id: string) => void
}

export function AhaSection({ moment, index, total, onActivate }: AhaSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
  })

  // IntersectionObserver: when the sticky inner crosses viewport center,
  // mark this moment as active for the right-rail dots.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            onActivate(moment.id)
          }
        }
      },
      { threshold: [0.5], rootMargin: '-20% 0px -20% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [moment.id, onActivate])

  const accent =
    moment.visualHint?.accentColor ?? CATEGORY_ACCENT[moment.category]

  return (
    <section
      ref={ref}
      data-aha-id={moment.id}
      data-aha-index={index}
      className="relative h-[200vh] w-full"
      aria-label={`Aha moment ${index + 1} of ${total}: ${moment.title}`}
    >
      <div className="sticky top-0 flex h-screen w-full items-center px-8 sm:px-16 lg:px-24">
        <div className="grid h-full w-full grid-cols-1 items-center gap-12 lg:grid-cols-[40%_60%]">
          <AhaTextColumn
            moment={moment}
            index={index}
            total={total}
            accent={accent}
            progress={smoothProgress}
          />
          <BeforeAfterPanel
            moment={moment}
            accent={accent}
            progress={smoothProgress}
          />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// AhaTextColumn: the 6-field card on the left
// ---------------------------------------------------------------------------

interface AhaTextColumnProps {
  moment: AhaMoment
  index: number
  total: number
  accent: string
  progress: MotionValue<number>
}

function AhaTextColumn({
  moment,
  index,
  total,
  accent,
  progress,
}: AhaTextColumnProps) {
  // Text scrolls past slightly faster than the sticky panel for parallax.
  const y = useTransform(progress, [0, 1], [40, -40])
  const ahaScale = useTransform(progress, [0.3, 0.5, 0.7], [0.96, 1.04, 1])
  const ahaOpacity = useTransform(progress, [0.25, 0.45, 0.55, 0.9], [0.3, 1, 1, 1])

  return (
    <motion.div
      style={{ y }}
      className="flex flex-col gap-6 max-w-xl"
    >
      {/* Index + session metadata */}
      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-[rgb(var(--color-fg-muted))]">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            background: `${accent}1A`,
            color: accent,
            fontFamily: 'var(--font-brand)',
            fontWeight: 700,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{moment.sessionShipped}</span>
        <span aria-hidden>/</span>
        <span>{moment.dateShipped}</span>
        <span aria-hidden>/</span>
        <span style={{ color: accent }}>{moment.category}</span>
      </div>

      {/* Title */}
      <h2
        className="text-3xl sm:text-4xl leading-tight tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {moment.title}
      </h2>

      {/* Hook */}
      <p className="text-sm leading-relaxed text-[rgb(var(--color-fg-muted))] italic">
        {moment.hook}
      </p>

      {/* Before */}
      <FieldRow label="Before" accent={accent}>
        <p className="text-base leading-relaxed text-[rgb(var(--color-fg))]">
          {moment.before}
        </p>
      </FieldRow>

      {/* Aha (display, signal accent, scales on scroll) */}
      <motion.div
        style={{ scale: ahaScale, opacity: ahaOpacity }}
        className="border-l-2 pl-5 py-2"
        data-empire-aha="signal-accent"
      >
        <p
          className="text-2xl sm:text-3xl leading-snug"
          style={{
            fontFamily: 'var(--font-display)',
            color: accent,
            borderLeftColor: accent,
          }}
        >
          <AuroraText
            duration={6}
            colors={[accent, 'rgb(var(--color-fg))', accent, 'rgb(var(--color-accent-2))', accent]}
          >
            {moment.aha}
          </AuroraText>
        </p>
      </motion.div>

      {/* After */}
      <FieldRow label="After" accent={accent}>
        <p className="text-base leading-relaxed text-[rgb(var(--color-fg))]">
          {moment.after}
        </p>
      </FieldRow>

      {/* Efficiency chip with ShineBorder + NumberTicker on parsed stats */}
      <ShineBorder
        borderRadius={8}
        borderWidth={1.5}
        duration={6}
        color={accent}
        color2="rgb(var(--color-accent-2))"
        className="inline-block"
      >
        <div
          className="flex items-start gap-2 rounded-md px-3 py-2 text-sm"
          style={{
            background: `${accent}0D`,
            color: 'rgb(var(--color-fg))',
            border: `1px solid ${accent}26`,
          }}
        >
          <Sparkles size={14} className="mt-1 shrink-0" style={{ color: accent }} />
          <span>
            <EfficiencyWithTicker text={moment.efficiency} accent={accent} />
          </span>
        </div>
      </ShineBorder>

      {/* Foundation footer */}
      <p className="text-xs italic text-[rgb(var(--color-fg-muted))]">
        Foundation: {moment.foundation}
      </p>

      {/* "leads to next" arrow when not last */}
      {index < total - 1 && (
        <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[rgb(var(--color-fg-subtle))]">
          <span>Leads to</span>
          <ArrowDown size={14} />
        </div>
      )}
    </motion.div>
  )
}

/**
 * EfficiencyWithTicker: parses out the leading numeric tokens (e.g. "30%",
 * "1,047", "2 events", "76%") in the efficiency string and replaces each
 * with a NumberTicker that counts up on viewport entry. Falls back to the
 * raw string if no tokens are matched.
 */
function EfficiencyWithTicker({
  text,
  accent,
}: {
  text: string
  accent: string
}) {
  const parts = useMemo(() => {
    // Match comma-separated integers, decimals, percentages, and units
    // like "30%", "1,047", "76", "2 events", "0.5". Keep order intact.
    const re = /([\d,]+(?:\.\d+)?)(\s*%|\s*x)?/g
    const out: Array<
      | { kind: 'text'; value: string }
      | { kind: 'num'; value: number; suffix: string }
    > = []
    let lastIdx = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIdx) {
        out.push({ kind: 'text', value: text.slice(lastIdx, m.index) })
      }
      const raw = m[1].replace(/,/g, '')
      const n = parseFloat(raw)
      const suffix = (m[2] ?? '').trim()
      if (!isNaN(n)) {
        out.push({ kind: 'num', value: n, suffix })
      } else {
        out.push({ kind: 'text', value: m[0] })
      }
      lastIdx = m.index + m[0].length
    }
    if (lastIdx < text.length) {
      out.push({ kind: 'text', value: text.slice(lastIdx) })
    }
    return out
  }, [text])

  return (
    <span>
      {parts.map((p, i) =>
        p.kind === 'text' ? (
          <span key={i}>{p.value}</span>
        ) : (
          <NumberTicker
            key={i}
            value={p.value}
            decimals={Number.isInteger(p.value) ? 0 : 1}
            suffix={p.suffix}
            duration={1.4}
            style={{
              fontFamily: 'var(--font-brand)',
              fontWeight: 700,
              color: accent,
            }}
          />
        ),
      )}
    </span>
  )
}

function FieldRow({
  label,
  accent,
  children,
}: {
  label: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[10px] uppercase tracking-[0.22em]"
        style={{ color: accent, fontFamily: 'var(--font-brand)', fontWeight: 700 }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// BeforeAfterPanel: the right-col transformer (BEFORE -> AHA flash -> AFTER)
// ---------------------------------------------------------------------------

interface BeforeAfterPanelProps {
  moment: AhaMoment
  accent: string
  progress: MotionValue<number>
}

function BeforeAfterPanel({ moment, accent, progress }: BeforeAfterPanelProps) {
  // Three-phase transform on the same MotionValue:
  // 0.00 .. 0.40  BEFORE state, greyscale 1, washed
  // 0.40 .. 0.50  AHA flash, signal-orange burst overlay opacity 0 -> 1 -> 0
  // 0.50 .. 1.00  AFTER state, greyscale 0, full color
  const beforeFilter = useTransform(
    progress,
    [0, 0.4, 0.5, 1],
    ['grayscale(100%) brightness(0.9)', 'grayscale(100%) brightness(0.9)', 'grayscale(0%) brightness(1)', 'grayscale(0%) brightness(1)'],
  )
  const flashOpacity = useTransform(
    progress,
    [0.38, 0.45, 0.5, 0.55],
    [0, 0.85, 0.85, 0],
  )
  const beforeOpacity = useTransform(progress, [0, 0.45, 0.5], [1, 1, 0])
  const afterOpacity = useTransform(progress, [0.45, 0.5, 0.6], [0, 0, 1])

  // Sparkles burst is on/off binary, fired in the narrow window around the flash.
  const [sparkActive, setSparkActive] = useState(false)
  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      const inWindow = v > 0.42 && v < 0.58
      setSparkActive((prev) => (prev !== inWindow ? inWindow : prev))
    })
    return () => unsub()
  }, [progress])

  const Icon = iconForKind(moment.visualHint?.iconKind)

  return (
    <ContainerScroll
      className="relative flex h-full max-h-[80vh] w-full items-center justify-center"
      fromRotate={-4}
      toRotate={0}
      fromScale={0.94}
      toScale={1}
    >
      <motion.div
        style={{ filter: beforeFilter, minHeight: '60vh' }}
        className="relative h-full w-full overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-sm"
      >
        {/* BEFORE layer */}
        <motion.div
          style={{ opacity: beforeOpacity }}
          className="absolute inset-0 flex items-center justify-center p-12"
        >
          <BeforeAfterArtwork
            kind={moment.visualHint?.iconKind ?? 'lightbulb'}
            label="Before"
            note={moment.before}
            accent="#9DB0BF"
            Icon={Icon}
            washed
          />
        </motion.div>

        {/* AFTER layer */}
        <motion.div
          style={{ opacity: afterOpacity }}
          className="absolute inset-0 flex items-center justify-center p-12"
        >
          <BeforeAfterArtwork
            kind={moment.visualHint?.iconKind ?? 'lightbulb'}
            label="After"
            note={moment.after}
            accent={accent}
            Icon={Icon}
          />
        </motion.div>

        {/* AHA flash overlay: signal-orange radial burst + sparkles */}
        <motion.div
          aria-hidden
          style={{ opacity: flashOpacity }}
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${accent} 0%, ${accent}80 30%, transparent 70%)`,
              mixBlendMode: 'screen',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-[clamp(1.5rem,3.2vw,3rem)] tracking-tight text-center px-12"
              style={{
                fontFamily: 'var(--font-display)',
                color: '#FFFFFF',
                textShadow: `0 0 24px ${accent}`,
              }}
            >
              <AuroraText
                duration={3.5}
                colors={['#FFFFFF', accent, '#FFE0CC', accent, '#FFFFFF']}
              >
                {moment.aha}
              </AuroraText>
            </div>
          </div>
        </motion.div>

        {/* SparklesBurst fires only during the narrow flash window */}
        <SparklesBurst active={sparkActive} color={accent} count={24} radius={180} />

        {/* Hairline crosshair, decorative */}
        <Crosshair />

        {/* Foundation arrow (bottom-right) hints at next section */}
        <FoundationArrow accent={accent} />
      </motion.div>
    </ContainerScroll>
  )
}

function BeforeAfterArtwork({
  label,
  note,
  accent,
  Icon,
  washed = false,
}: {
  kind: AhaIconKind
  label: string
  note: string
  accent: string
  Icon: React.ComponentType<{ size?: number; className?: string; style?: CSSProperties }>
  washed?: boolean
}) {
  return (
    <div className="flex max-w-md flex-col items-start gap-6">
      <span
        className="text-[10px] uppercase tracking-[0.22em]"
        style={{ color: accent, fontFamily: 'var(--font-brand)', fontWeight: 700 }}
      >
        {label}
      </span>
      <div
        className="flex items-center justify-center rounded-2xl border p-10"
        style={{
          borderColor: washed ? '#D1D5DB' : accent,
          background: washed ? '#F2F4F7' : `${accent}10`,
          width: 220,
          height: 220,
        }}
      >
        <Icon
          size={96}
          className=""
          style={{ color: washed ? '#9DB0BF' : accent }}
        />
      </div>
      <p
        className="max-w-sm text-sm leading-relaxed"
        style={{
          color: washed ? '#6B8090' : 'rgb(var(--color-fg))',
          fontStyle: washed ? 'italic' : 'normal',
        }}
      >
        {note}
      </p>
    </div>
  )
}

function Crosshair() {
  return (
    <>
      <div
        aria-hidden
        className="absolute left-4 top-4 h-3 w-3 border-l border-t border-[rgb(var(--color-border))]"
      />
      <div
        aria-hidden
        className="absolute right-4 top-4 h-3 w-3 border-r border-t border-[rgb(var(--color-border))]"
      />
      <div
        aria-hidden
        className="absolute left-4 bottom-4 h-3 w-3 border-l border-b border-[rgb(var(--color-border))]"
      />
      <div
        aria-hidden
        className="absolute right-4 bottom-4 h-3 w-3 border-r border-b border-[rgb(var(--color-border))]"
      />
    </>
  )
}

function FoundationArrow({ accent }: { accent: string }) {
  return (
    <div
      className="absolute bottom-6 right-6 flex items-center gap-2 text-xs uppercase tracking-[0.18em]"
      style={{ color: accent, fontFamily: 'var(--font-brand)' }}
    >
      <span>Foundation</span>
      <ArrowDown size={14} />
    </div>
  )
}

function iconForKind(
  kind: AhaIconKind | undefined,
): React.ComponentType<{ size?: number; className?: string; style?: CSSProperties }> {
  switch (kind) {
    case 'graph':
      return Network
    case 'spark':
      return Sparkles
    case 'skill':
      return Wrench
    case 'lightbulb':
    default:
      return Lightbulb
  }
}

// ---------------------------------------------------------------------------
// ScrollProgressRail: right-edge vertical dots + GSAP-drawn connector line
// ---------------------------------------------------------------------------

interface ScrollProgressRailProps {
  moments: AhaMoment[]
  activeId: string
}

export function ScrollProgressRail({ moments, activeId }: ScrollProgressRailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  // GSAP ScrollTrigger draws the connector line as the user scrolls the page.
  useEffect(() => {
    const line = lineRef.current
    if (!line) return
    const ctx = gsap.context(() => {
      gsap.set(line, { scaleY: 0, transformOrigin: 'top' })
      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={railRef}
      className="pointer-events-none fixed right-6 top-1/2 z-30 -translate-y-1/2 lg:right-10"
      aria-hidden
    >
      <div className="relative flex flex-col items-center gap-5">
        {/* Connector line, GSAP-driven scaleY */}
        <div
          ref={lineRef}
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
          style={{ background: 'rgb(var(--color-accent))' }}
        />
        {moments.map((m, idx) => (
          <ProgressDot
            key={m.id}
            moment={m}
            index={idx}
            isActive={m.id === activeId}
          />
        ))}
      </div>
    </div>
  )
}

function ProgressDot({
  moment,
  index,
  isActive,
}: {
  moment: AhaMoment
  index: number
  isActive: boolean
}) {
  const accent =
    moment.visualHint?.accentColor ?? CATEGORY_ACCENT[moment.category]

  function handleJump() {
    const target = document.querySelector(
      `[data-aha-id="${moment.id}"]`,
    ) as HTMLElement | null
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      onClick={handleJump}
      className="pointer-events-auto group relative flex items-center gap-3 outline-none"
      aria-label={`Jump to ${moment.title}`}
      type="button"
    >
      {/* Tooltip pill on hover, slides out from the dot */}
      <span
        className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: 'rgb(var(--color-surface-2))',
          borderColor: 'rgb(var(--color-border))',
          color: 'rgb(var(--color-fg))',
          fontFamily: 'var(--font-brand)',
        }}
      >
        {String(index + 1).padStart(2, '0')} / {moment.title}
      </span>
      <motion.span
        animate={{
          scale: isActive ? 1.4 : 1,
          backgroundColor: isActive ? accent : 'rgba(157, 176, 191, 0.4)',
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="block h-2 w-2 rounded-full"
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// FinalCtaSection: "explore the full graph" -> ?treatment=c
// ---------------------------------------------------------------------------

function FinalCtaSection({ exploreHref }: { exploreHref: string }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.6], [40, 0])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden px-8 py-32"
      aria-label="Empire timeline final CTA"
    >
      {/* Vortex animated background swirl, paper-friendly */}
      <Vortex className="absolute inset-0">
        <span aria-hidden />
      </Vortex>
      <GridPattern cell={48} opacity={0.04} />

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 flex max-w-3xl flex-col items-center gap-8 text-center"
      >
        <span
          className="text-xs uppercase tracking-[0.22em]"
          style={{
            fontFamily: 'var(--font-brand)',
            color: 'rgb(var(--color-fg-muted))',
          }}
        >
          <AnimatedShinyText>End of the chronological arc</AnimatedShinyText>
        </span>
        <h2
          className="text-[clamp(2rem,4vw,3.5rem)] leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Each aha enabled the next.{' '}
          <AnimatePresence>
            <motion.span
              key="seethe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatedGradientText>
                See the full dependency graph.
              </AnimatedGradientText>
            </motion.span>
          </AnimatePresence>
        </h2>

        {/* Live counters of the 7 moments */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-[rgb(var(--color-fg-muted))]">
          <CounterChip label="aha moments" value={7} />
          <CounterChip label="hard hitters" value={7} suffix=" / 7" />
          <CounterChip label="cumulative score" value={71} />
          <CounterChip label="categories spanned" value={5} />
        </div>

        <a
          href={exploreHref}
          className="group relative inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium transition-all"
          style={{
            background: 'rgb(var(--color-accent))',
            color: 'rgb(var(--color-bg))',
            fontFamily: 'var(--font-brand)',
            letterSpacing: '0.04em',
            boxShadow: '0 12px 32px rgb(var(--color-accent) / 0.32), 0 0 0 1px rgb(var(--color-accent) / 0.6) inset',
          }}
        >
          Explore the full graph
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
          <span aria-hidden className="absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgb(var(--color-accent-2) / 0.5) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />
        </a>
        <p className="max-w-xl text-sm text-[rgb(var(--color-fg-muted))]">
          Treatment C reveals the radial dependency map: which aha enabled which,
          which categories cluster, where the architecture roots are.
        </p>
      </motion.div>
    </section>
  )
}

function CounterChip({
  label,
  value,
  suffix = '',
}: {
  label: string
  value: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <NumberTicker
        value={value}
        suffix={suffix}
        className="text-3xl tabular-nums"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'rgb(var(--color-fg))',
        }}
        duration={1.8}
      />
      <span
        className="text-[10px] uppercase tracking-[0.22em]"
        style={{
          fontFamily: 'var(--font-brand)',
          color: 'rgb(var(--color-accent))',
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    </div>
  )
}

// Named exports for downstream stories / treatment-B reuse.
export { BeforeAfterPanel, FinalCtaSection }
