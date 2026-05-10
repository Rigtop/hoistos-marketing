/**
 * EmpireTimeline-c (treatment C: Histography + Karpathy-graphify radial
 * dependency graph).
 *
 * B2 Phase 4, S197 night, 2026-05-07. Spec:
 *   /Users/eugeenbernan/Desktop/Outputs/AI Systems/Strategy/empire-wireframe/artifacts/B2/phase-1-spec.md
 *
 * Layout:
 *   - Full-viewport SVG canvas. Pan via pointer drag, zoom via wheel.
 *   - Each AhaMoment is a circle node. Radius 4 to 14 px scales with score.
 *   - Color by category (locked override in this treatment, not from the
 *     shared CATEGORY_ACCENT map):
 *       architecture = ink (#111827)
 *       skill        = signal (#F25A00)
 *       automation   = signal-2 (#FF8A3D)
 *       rule         = steel (#6B8090)
 *       vibes        = signal at 50% (#F25A00 alpha 0.5)
 *   - Edges computed from .enables[] (and union of .enabledBy[]). Edge
 *     stroke = source node category color, opacity 0.4 baseline.
 *   - Force simulation: forceLink distance 80, forceManyBody charge -200,
 *     forceCenter attractor.
 *   - Node hover: scale 1.5x, label in DM Serif Display, incident edges
 *     highlight to opacity 1.
 *   - Node click: right-edge side panel (400px wide) renders the full
 *     Hook / Before / Aha / After / Efficiency / Foundation card. Close on
 *     outside click or Esc.
 *   - Top filter pills: all / architecture / skill / automation / rule /
 *     vibes. Non-matching nodes dim to opacity 0.15.
 *   - Bottom-left legend: category color swatches.
 *   - Top-left header: HoistOS mark + "Empire Aha Map" + "<N> moments shown".
 *   - Bottom-right footer: "drag to pan, scroll to zoom".
 *
 * Hard Rule #11: zero em dashes in this file (verified via local search).
 * Hard Rule #31: Context7 disclosures emitted before write for d3-force,
 * motion, lucide-react (parent runner record).
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, Layers, Cpu, Network, Compass, Filter } from 'lucide-react'

import {
  MOCK_AHA_MOMENTS,
  type AhaCategory,
  type AhaMoment,
} from '../empire/content/types'

import {
  FollowingPointer,
  AnimatedTooltip,
  Lamp,
  FloatingDock,
  SparklesBurst,
  type DockItem,
} from './ui/aceternity'
import {
  NumberTicker,
  Marquee,
  ShineBorder,
  FlickeringGrid,
  Lens,
  AnimatedBeamSvg,
  AnimatedShinyText,
  BlurFade,
  Particles,
} from './ui/magicui'

// ---------------------------------------------------------------------------
// Treatment C category palette (locked override per phase-4 spec)
// ---------------------------------------------------------------------------

const TREATMENT_C_COLOR: Record<AhaCategory, string> = {
  architecture: '#111827', // ink
  skill: '#F25A00', // signal
  automation: '#FF8A3D', // signal-2
  rule: '#6B8090', // steel
  vibes: 'rgba(242, 90, 0, 0.55)', // signal-soft, signal at ~50%
}

const CATEGORY_ORDER: ReadonlyArray<AhaCategory> = [
  'architecture',
  'skill',
  'automation',
  'rule',
  'vibes',
]

const CATEGORY_LABEL: Record<AhaCategory, string> = {
  architecture: 'architecture',
  skill: 'skill',
  automation: 'automation',
  rule: 'rule',
  vibes: 'vibes',
}

// ---------------------------------------------------------------------------
// Local force-simulation typings
// ---------------------------------------------------------------------------

interface ForceNode extends SimulationNodeDatum {
  id: string
  moment: AhaMoment
  radius: number
  category: AhaCategory
}

type ForceLink = SimulationLinkDatum<ForceNode>

interface ResolvedLink {
  source: ForceNode
  target: ForceNode
  category: AhaCategory
  fromId: string
  toId: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map score in [3, 12] to radius in [4, 14] px. Clamped on the ends. */
function radiusFromScore(score: number): number {
  const lo = 3
  const hi = 12
  const clamped = Math.max(lo, Math.min(hi, score))
  return 4 + ((clamped - lo) / (hi - lo)) * 10
}

/**
 * Build the symmetric edge set. Each enables[] pair is one edge from source
 * (the one that enables) to target. We also pull from enabledBy[] to catch
 * edges that only one side declares; duplicates are de-duplicated by an
 * unordered key. Edge category is the source's category.
 */
function buildLinks(moments: AhaMoment[]): { fromId: string; toId: string }[] {
  const ids = new Set(moments.map((m) => m.id))
  const seen = new Set<string>()
  const out: { fromId: string; toId: string }[] = []
  const add = (fromId: string, toId: string) => {
    if (!ids.has(fromId) || !ids.has(toId) || fromId === toId) return
    const key = `${fromId}->${toId}`
    if (seen.has(key)) return
    seen.add(key)
    out.push({ fromId, toId })
  }
  for (const m of moments) {
    for (const t of m.enables) add(m.id, t)
    for (const s of m.enabledBy) add(s, m.id)
  }
  return out
}

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

export interface EmpireTimelineCProps {
  /** Aha moments to render. Falls back to MOCK_AHA_MOMENTS when omitted. */
  moments?: AhaMoment[]
  /** Brand wordmark text shown in header. */
  brandMark?: string
  /** Headline rendered in serif display font. */
  headline?: string
  /** className override on the outer wrapper. */
  className?: string
}

// ---------------------------------------------------------------------------
// Default export: EmpireTimelineC
// ---------------------------------------------------------------------------

export default function EmpireTimelineC({
  moments = MOCK_AHA_MOMENTS,
  brandMark = 'HoistOS',
  headline = 'Empire Aha Map',
  className,
}: EmpireTimelineCProps) {
  // ---- viewport sizing ----------------------------------------------------
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: 1200,
    h: 800,
  })
  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect
        setSize({ w: Math.max(640, cr.width), h: Math.max(480, cr.height) })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ---- data prep ---------------------------------------------------------
  const { nodes, links } = useMemo(() => {
    const ns: ForceNode[] = moments.map((m) => ({
      id: m.id,
      moment: m,
      radius: radiusFromScore(m.score),
      category: m.category,
      x: undefined,
      y: undefined,
    }))
    const linkPairs = buildLinks(moments)
    const byId = new Map(ns.map((n) => [n.id, n]))
    const ls: ForceLink[] = linkPairs.map((p) => ({
      source: byId.get(p.fromId)!,
      target: byId.get(p.toId)!,
    }))
    return { nodes: ns, links: ls }
  }, [moments])

  // ---- force simulation --------------------------------------------------
  const simRef = useRef<Simulation<ForceNode, ForceLink> | null>(null)
  const [, forceTick] = useState(0)
  useEffect(() => {
    const sim = forceSimulation<ForceNode>(nodes)
      .force(
        'link',
        forceLink<ForceNode, ForceLink>(links)
          .id((d) => d.id)
          .distance(80)
          .strength(0.6),
      )
      .force('charge', forceManyBody<ForceNode>().strength(-200))
      .force('center', forceCenter<ForceNode>(size.w / 2, size.h / 2))
      .force(
        'collide',
        forceCollide<ForceNode>().radius((d) => d.radius + 6),
      )
      .alpha(1)
      .alphaDecay(0.025)
      .on('tick', () => forceTick((n) => (n + 1) % 1_000_000))
    simRef.current = sim
    return () => {
      sim.stop()
    }
  }, [nodes, links, size.w, size.h])

  // ---- pan / zoom --------------------------------------------------------
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const dragRef = useRef<{
    active: boolean
    startX: number
    startY: number
    origX: number
    origY: number
  }>({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 })

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const target = e.target as Element
      // Skip drag if pointer landed on a node circle (let click bubble).
      if (target?.getAttribute('data-node-id')) return
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: transform.x,
        origY: transform.y,
      }
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    },
    [transform.x, transform.y],
  )

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setTransform((t) => ({
        ...t,
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      }))
    },
    [],
  )

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      dragRef.current.active = false
      try {
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      } catch {
        // pointer was never captured, ignore.
      }
    },
    [],
  )

  const onWheel = useCallback((e: ReactWheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    setTransform((t) => {
      const nextK = Math.max(0.4, Math.min(3, t.k * (1 + delta)))
      // Zoom toward cursor position: solve so that cursor stays put.
      const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const ratio = nextK / t.k
      const nextX = cx - (cx - t.x) * ratio
      const nextY = cy - (cy - t.y) * ratio
      return { x: nextX, y: nextY, k: nextK }
    })
  }, [])

  // ---- filter / hover / select ------------------------------------------
  const [filter, setFilter] = useState<'all' | AhaCategory>('all')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Esc closes panel; 1-5 select category filters; 0 clears filter.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
      if (e.key === '0') setFilter('all')
      if (e.key === '1') setFilter('architecture')
      if (e.key === '2') setFilter('skill')
      if (e.key === '3') setFilter('automation')
      if (e.key === '4') setFilter('rule')
      if (e.key === '5') setFilter('vibes')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const matchesFilter = useCallback(
    (cat: AhaCategory) => filter === 'all' || filter === cat,
    [filter],
  )

  const incidentEdgeIds = useMemo(() => {
    if (!hoverId && !selectedId) return new Set<string>()
    const focusId = hoverId ?? selectedId
    const acc = new Set<string>()
    for (const l of links) {
      const src = l.source as ForceNode
      const tgt = l.target as ForceNode
      if (src.id === focusId || tgt.id === focusId) {
        acc.add(`${src.id}->${tgt.id}`)
      }
    }
    return acc
  }, [hoverId, selectedId, links])

  const resolvedLinks = useMemo<ResolvedLink[]>(() => {
    return links
      .map((l) => {
        const source = l.source as ForceNode
        const target = l.target as ForceNode
        if (
          !source ||
          !target ||
          typeof source.x !== 'number' ||
          typeof target.x !== 'number'
        ) {
          return null
        }
        return {
          source,
          target,
          category: source.category,
          fromId: source.id,
          toId: target.id,
        }
      })
      .filter((x): x is ResolvedLink => x !== null)
  }, [links, /* re-evaluate on every tick */ forceTickKey(simRef)])

  const selectedMoment = useMemo(() => {
    if (!selectedId) return null
    return moments.find((m) => m.id === selectedId) ?? null
  }, [selectedId, moments])

  // ---- render ------------------------------------------------------------
  const wrapperStyle: CSSProperties = {
    background: 'rgb(var(--color-bg))',
    color: 'rgb(var(--color-fg))',
  }

  const visibleCount = moments.filter(
    (m) => filter === 'all' || m.category === filter,
  ).length

  // Spark + identifying tooltip state for hovered nodes (viewport coords)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [filterPulse, setFilterPulse] = useState(false)
  function handleFilter(opt: 'all' | AhaCategory) {
    setFilter(opt)
    setFilterPulse(true)
    window.setTimeout(() => setFilterPulse(false), 900)
  }

  // Compute the hovered moment for the tooltip
  const hoveredMoment = useMemo(() => {
    if (!hoverId) return null
    return moments.find((m) => m.id === hoverId) ?? null
  }, [hoverId, moments])

  // Active node screen position for SparklesBurst overlay
  const activeNode = nodes.find((n) => n.id === selectedId)

  // Treatment-switch dock items
  const dockItems: DockItem[] = useMemo(() => [
    {
      id: 'a',
      label: 'Vertical scroll',
      icon: <Layers size={18} />,
      href: '?treatment=a',
    },
    {
      id: 'b',
      label: 'Keynote tunnel',
      icon: <Cpu size={18} />,
      href: '?treatment=b',
    },
    {
      id: 'c',
      label: 'Dependency graph (this)',
      icon: <Network size={18} />,
      active: true,
    },
    {
      id: 'reset',
      label: 'Reset filters + zoom',
      icon: <Compass size={18} />,
      onClick: () => {
        setFilter('all')
        setSelectedId(null)
        setTransform({ x: 0, y: 0, k: 1 })
      },
    },
  ], [])

  return (
    <div
      ref={wrapperRef}
      data-theme="hoistos-light"
      className={[
        'relative w-full h-screen overflow-hidden select-none',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={wrapperStyle}
    >
      {/* Layered backgrounds: FlickeringGrid + Lamp at top + bottom edges */}
      <FlickeringGrid
        squareSize={3}
        gridGap={8}
        flickerChance={0.12}
        color="rgb(var(--color-accent))"
        maxOpacity={0.18}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 h-40 opacity-50"
      >
        <Lamp
          color="rgb(var(--color-accent))"
          width={900}
          height={180}
          caption="Aha dependency map"
        />
      </div>

      {/* FollowingPointer custom cursor showing filter context */}
      <FollowingPointer
        active={true}
        color="rgb(var(--color-accent))"
        label={
          filter === 'all'
            ? 'all categories'
            : `filter: ${filter}`
        }
      />

      {/* SparklesBurst on filter activation, pinned center-top */}
      <div className="pointer-events-none absolute left-1/2 top-32 z-30 -translate-x-1/2">
        <SparklesBurst
          active={filterPulse}
          color="rgb(var(--color-accent))"
          count={20}
          radius={140}
        />
      </div>

      {/* SparklesBurst pinned to active node when one is selected */}
      {activeNode && typeof activeNode.x === 'number' && typeof activeNode.y === 'number' && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: transform.x + activeNode.x * transform.k,
            top: transform.y + activeNode.y * transform.k,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <SparklesBurst
            active={!!selectedId}
            color="rgb(var(--color-accent))"
            count={14}
            radius={80}
          />
          {/* Magic UI Particles emitting from the active node */}
          <div className="relative h-32 w-32 -translate-x-1/2 -translate-y-1/2">
            <Particles count={28} color="rgb(var(--color-accent))" speed={0.6} />
          </div>
        </div>
      )}

      {/* FloatingDock for treatment switching */}
      <FloatingDock items={dockItems} />

      <svg
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{
          touchAction: 'none',
          cursor: dragRef.current.active ? 'grabbing' : 'grab',
        }}
      >
        <defs>
          {CATEGORY_ORDER.map((cat) => (
            <marker
              key={cat}
              id={`arrow-${cat}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={TREATMENT_C_COLOR[cat]} />
            </marker>
          ))}
        </defs>

        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
        >
          {/* edges first so nodes stack on top.
              Incident edges render as AnimatedBeamSvg with flowing dashes;
              non-incident edges remain plain lines for performance. */}
          {resolvedLinks.map((l) => {
            const key = `${l.fromId}->${l.toId}`
            const dim =
              filter !== 'all' &&
              !matchesFilter(l.source.category) &&
              !matchesFilter(l.target.category)
            const incident = incidentEdgeIds.has(key)
            const baseOpacity = dim ? 0.05 : incident ? 1 : 0.4
            const x1 = l.source.x ?? 0
            const y1 = l.source.y ?? 0
            const x2 = l.target.x ?? 0
            const y2 = l.target.y ?? 0
            // Curved path for incident (highlighted) edges so the AnimatedBeam
            // dash flow reads as motion, not static stripes.
            const dx = x2 - x1
            const dy = y2 - y1
            const mx = (x1 + x2) / 2
            const my = (y1 + y2) / 2
            const norm = Math.sqrt(dx * dx + dy * dy) || 1
            const nx = -dy / norm
            const ny = dx / norm
            const arc = Math.min(40, norm * 0.18)
            const cx = mx + nx * arc
            const cy = my + ny * arc
            const pathD = `M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`
            if (incident) {
              return (
                <g key={key}>
                  <AnimatedBeamSvg
                    d={pathD}
                    color={TREATMENT_C_COLOR[l.category]}
                    width={2}
                    duration={1.6}
                    opacity={baseOpacity}
                  />
                </g>
              )
            }
            return (
              <line
                key={key}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={TREATMENT_C_COLOR[l.category]}
                strokeOpacity={baseOpacity}
                strokeWidth={1}
                markerEnd={`url(#arrow-${l.category})`}
                style={{ transition: 'stroke-opacity 200ms, stroke-width 200ms' }}
              />
            )
          })}

          {/* nodes */}
          {nodes.map((n) => {
            if (typeof n.x !== 'number' || typeof n.y !== 'number') return null
            const dim = !matchesFilter(n.category)
            const isHover = hoverId === n.id
            const isSelected = selectedId === n.id
            const opacity = dim ? 0.15 : 1
            const scale = isHover || isSelected ? 1.5 : 1
            const fill = TREATMENT_C_COLOR[n.category]
            return (
              <g key={n.id}>
                <motion.circle
                  data-node-id={n.id}
                  cx={n.x}
                  cy={n.y}
                  r={n.radius}
                  fill={fill}
                  stroke={isSelected ? 'rgb(var(--color-accent))' : 'transparent'}
                  strokeWidth={isSelected ? 2.5 : 0}
                  initial={false}
                  animate={{ scale, opacity }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  style={{
                    transformOrigin: `${n.x}px ${n.y}px`,
                    cursor: 'pointer',
                  }}
                  onPointerEnter={(e) => {
                    setHoverId(n.id)
                    setTooltipPos({ x: e.clientX, y: e.clientY })
                  }}
                  onPointerMove={(e) => {
                    setTooltipPos({ x: e.clientX, y: e.clientY })
                  }}
                  onPointerLeave={() => {
                    setHoverId((h) => (h === n.id ? null : h))
                    setTooltipPos(null)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(n.id)
                  }}
                />
                {/* Selected-node ShineBorder pulse: render an outer ring */}
                {isSelected && (
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    r={n.radius * 2.4}
                    fill="none"
                    stroke="rgb(var(--color-accent))"
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                    initial={{ opacity: 0.7, scale: 0.6 }}
                    animate={{
                      opacity: [0.7, 0, 0.7],
                      scale: [0.6, 1.4, 0.6],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                )}
                <AnimatePresence>
                  {(isHover || isSelected) && !dim && (
                    <motion.text
                      key={`label-${n.id}`}
                      x={n.x}
                      y={(n.y ?? 0) - n.radius * 1.5 - 8}
                      textAnchor="middle"
                      initial={{ opacity: 0, y: (n.y ?? 0) - n.radius * 1.5 - 4 }}
                      animate={{
                        opacity: 1,
                        y: (n.y ?? 0) - n.radius * 1.5 - 8,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        fontFamily:
                          '"DM Serif Display", Georgia, serif',
                        fontSize: 18,
                        fill: 'rgb(var(--color-fg))',
                        pointerEvents: 'none',
                      }}
                    >
                      {n.moment.title}
                    </motion.text>
                  )}
                </AnimatePresence>
              </g>
            )
          })}
        </g>
      </svg>

      {/* ---- header (top-left), with NumberTicker on visible count ---- */}
      <BlurFade delay={0.15} className="pointer-events-none absolute left-6 top-6 z-30">
        <div
          className="flex items-center gap-3"
          style={{ color: 'rgb(var(--color-fg))' }}
        >
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background: 'rgb(var(--color-surface-2))',
              border: '1px solid rgb(var(--color-border))',
            }}
          >
            <Sparkles size={14} style={{ color: 'rgb(var(--color-accent))' }} />
            <span
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              <AnimatedShinyText>{brandMark}</AnimatedShinyText>
            </span>
          </div>
          <div>
            <div
              className="font-display text-2xl leading-none"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              {headline}
            </div>
            <div
              className="mt-1 flex items-center gap-1.5"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              <NumberTicker
                value={visibleCount}
                duration={0.9}
                className="font-mono text-[12px] tabular-nums"
                style={{
                  color: 'rgb(var(--color-accent))',
                  fontWeight: 700,
                  fontFamily: 'var(--font-brand)',
                }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                moments shown
              </span>
              {filter !== 'all' && (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                  / {filter}
                </span>
              )}
            </div>
          </div>
        </div>
      </BlurFade>

      {/* ---- filter pills (top-center, ToggleGroup-style) ---- */}
      <BlurFade
        delay={0.25}
        className="pointer-events-auto absolute top-6 left-1/2 z-30 -translate-x-1/2"
      >
        <div
          className="flex items-center gap-1 rounded-full p-1"
          style={{
            background: 'rgba(255, 255, 255, 0.86)',
            border: '1px solid rgb(var(--color-border))',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 6px 20px rgba(17, 24, 39, 0.08)',
          }}
          role="group"
          aria-label="Filter moments by category"
        >
          <span
            aria-hidden
            className="ml-2 mr-1 flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              background: 'rgb(var(--color-surface))',
              color: 'rgb(var(--color-accent))',
            }}
          >
            <Filter size={12} />
          </span>
          {(['all', ...CATEGORY_ORDER] as const).map((opt) => {
            const isActive = filter === opt
            const swatch =
              opt === 'all' ? 'rgb(var(--color-fg))' : TREATMENT_C_COLOR[opt]
            return (
              <motion.button
                key={opt}
                onClick={() => handleFilter(opt)}
                whileTap={{ scale: 0.94 }}
                aria-pressed={isActive}
                className="relative font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
                style={{
                  background: isActive
                    ? 'rgb(var(--color-fg))'
                    : 'transparent',
                  color: isActive
                    ? 'rgb(var(--color-bg))'
                    : 'rgb(var(--color-fg-muted))',
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: swatch }}
                />
                {opt}
              </motion.button>
            )
          })}
        </div>
      </BlurFade>

      {/* ---- AnimatedTooltip on hovered node ---- */}
      <AnimatedTooltip
        visible={Boolean(hoveredMoment && tooltipPos && !selectedId)}
        x={tooltipPos?.x ?? 0}
        y={tooltipPos?.y ?? 0}
      >
        {hoveredMoment && (
          <div
            className="rounded-xl border px-3 py-2"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderColor: TREATMENT_C_COLOR[hoveredMoment.category],
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: `0 8px 24px ${TREATMENT_C_COLOR[hoveredMoment.category]}33`,
              maxWidth: 280,
            }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-[0.22em]"
              style={{
                color: TREATMENT_C_COLOR[hoveredMoment.category],
                fontWeight: 700,
              }}
            >
              {hoveredMoment.category} / score {hoveredMoment.score}
            </div>
            <div
              className="mt-1 text-[15px] leading-snug"
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                color: 'rgb(var(--color-fg))',
              }}
            >
              {hoveredMoment.title}
            </div>
            <div className="mt-1 text-[11px] italic text-[rgb(var(--color-fg-muted))]">
              {hoveredMoment.sessionShipped} / {hoveredMoment.dateShipped}
            </div>
          </div>
        )}
      </AnimatedTooltip>

      {/* ---- Lens magnifier overlay (decorative) ---- */}
      <Lens
        active={!selectedId}
        size={120}
        zoom={1.5}
        color="rgb(var(--color-accent))"
        containerRef={wrapperRef}
      />

      {/* ---- legend (bottom-left) ---- */}
      <div
        className="absolute left-6 bottom-6 rounded-xl px-4 py-3 flex flex-col gap-2"
        style={{
          background: 'rgb(var(--color-surface-2))',
          border: '1px solid rgb(var(--color-border))',
        }}
      >
        <div
          className="font-mono text-[9px] uppercase tracking-[0.22em]"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Category
        </div>
        {CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: TREATMENT_C_COLOR[cat] }}
            />
            <span
              className="font-mono text-[10px] tracking-[0.06em]"
              style={{ color: 'rgb(var(--color-fg))' }}
            >
              {CATEGORY_LABEL[cat]}
            </span>
          </div>
        ))}
      </div>

      {/* ---- footer hint (bottom-right) ---- */}
      <div
        className="absolute right-6 bottom-6 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        drag to pan, scroll to zoom, click any node
      </div>

      {/* ---- Marquee bottom: rotating filter shortcuts ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t py-2"
        style={{
          borderColor: 'rgb(var(--color-border))',
          background:
            'linear-gradient(to right, rgb(var(--color-surface)), rgb(var(--color-bg) / 0.6) 30%, rgb(var(--color-bg) / 0.6) 70%, rgb(var(--color-surface)))',
        }}
      >
        <Marquee duration={42}>
          {[
            'press 1 to filter architecture',
            'press 2 to filter skill',
            'press 3 to filter automation',
            'press 4 to filter rule',
            'press 5 to filter vibes',
            'press 0 to clear filters',
            'click any node to expand the card',
            'esc to close',
            'drag the canvas to pan, scroll to zoom',
          ].map((tip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.06em]"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              <span
                aria-hidden
                className="inline-block h-1 w-1 rounded-full"
                style={{ background: 'rgb(var(--color-accent))' }}
              />
              {tip}
            </span>
          ))}
        </Marquee>
      </div>

      {/* ---- side panel ---- */}
      <AnimatePresence>
        {selectedMoment && (
          <>
            <motion.div
              key="panel-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0"
              style={{ background: 'rgb(var(--color-bg) / 0.0)' }}
              onClick={() => setSelectedId(null)}
            />
            <motion.aside
              key="panel"
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
              className="absolute right-0 top-0 h-full w-[400px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ShineBorder
                borderRadius={0}
                borderWidth={2}
                duration={6}
                color={TREATMENT_C_COLOR[selectedMoment.category]}
                color2="rgb(var(--color-accent-2))"
                className="h-full w-full"
              >
                <div
                  className="h-full w-full overflow-y-auto"
                  style={{
                    background: 'rgb(var(--color-surface-2))',
                    borderLeft: '1px solid rgb(var(--color-border))',
                    boxShadow: '-12px 0 40px rgba(17, 24, 39, 0.08)',
                  }}
                >
                  <SidePanel
                    moment={selectedMoment}
                    onClose={() => setSelectedId(null)}
                  />
                </div>
              </ShineBorder>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SidePanel: full Hook / Before / Aha / After / Efficiency / Foundation card
// ---------------------------------------------------------------------------

interface SidePanelProps {
  moment: AhaMoment
  onClose: () => void
}

function SidePanel({ moment, onClose }: SidePanelProps) {
  const accent = TREATMENT_C_COLOR[moment.category]
  return (
    <div className="px-7 py-7 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: accent }}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: 'rgb(var(--color-fg-muted))' }}
          >
            {moment.category} / score {moment.score}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="p-1.5 rounded-full transition-colors"
          style={{
            color: 'rgb(var(--color-fg-muted))',
            background: 'transparent',
          }}
          onPointerEnter={(e) =>
            (e.currentTarget.style.background =
              'rgb(var(--color-surface))')
          }
          onPointerLeave={(e) =>
            (e.currentTarget.style.background = 'transparent')
          }
        >
          <X size={16} />
        </button>
      </div>

      <h2
        className="font-display text-3xl leading-tight"
        style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          color: 'rgb(var(--color-fg))',
        }}
      >
        {moment.title}
      </h2>

      <div
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        {moment.sessionShipped} / {moment.dateShipped}
      </div>

      <PanelSection label="Hook">{moment.hook}</PanelSection>
      <PanelSection label="Before">{moment.before}</PanelSection>

      <div
        className="rounded-2xl px-5 py-5"
        style={{
          background: 'rgb(var(--color-surface))',
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <div
          className="font-mono text-[9px] uppercase tracking-[0.22em] mb-2"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Aha
        </div>
        <p
          className="font-display text-xl leading-snug"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            color: 'rgb(var(--color-fg))',
          }}
        >
          {moment.aha}
        </p>
      </div>

      <PanelSection label="After">{moment.after}</PanelSection>

      <div
        className="rounded-xl px-4 py-3"
        style={{
          background: 'rgb(var(--color-surface))',
          border: '1px solid rgb(var(--color-border))',
        }}
      >
        <div
          className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1.5"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Efficiency
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'rgb(var(--color-fg))' }}
        >
          {moment.efficiency}
        </p>
      </div>

      <PanelSection label="Foundation">
        <span style={{ fontStyle: 'italic' }}>{moment.foundation}</span>
      </PanelSection>

      {(moment.enables.length > 0 || moment.enabledBy.length > 0) && (
        <div className="flex flex-col gap-2 pt-2">
          {moment.enables.length > 0 && (
            <div
              className="font-mono text-[10px] tracking-[0.06em]"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>
                enables:
              </span>{' '}
              {moment.enables.join(', ')}
            </div>
          )}
          {moment.enabledBy.length > 0 && (
            <div
              className="font-mono text-[10px] tracking-[0.06em]"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>
                enabled by:
              </span>{' '}
              {moment.enabledBy.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface PanelSectionProps {
  label: string
  children: React.ReactNode
}

function PanelSection({ label, children }: PanelSectionProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="font-mono text-[9px] uppercase tracking-[0.22em]"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        {label}
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        {children}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dummy hook used to force re-evaluation of resolvedLinks each tick.
// React doesn't track ref mutations from d3-force, so we read the simulation
// alpha to create a dependency that flips when the layout settles.
// ---------------------------------------------------------------------------

function forceTickKey(
  simRef: React.MutableRefObject<Simulation<ForceNode, ForceLink> | null>,
): number {
  return simRef.current?.alpha() ?? 0
}
