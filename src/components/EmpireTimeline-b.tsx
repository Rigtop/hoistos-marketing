/**
 * EmpireTimeline-b (Treatment B): horizontal Apple-keynote tunnel.
 *
 * Full-viewport React Three Fiber canvas. A signal-orange emissive rail extends
 * along the negative Z axis. Each AhaMoment renders as a floating panel along
 * the rail at staggered X / Y offsets for visual rhythm. Camera dollies to the
 * active panel via lerp, driven by either Lenis-cooperative wheel events,
 * Right / Space (next), Left (prev), or click-to-jump on a panel.
 *
 * B2 Phase 3, S197 night, 2026-05-07.
 *
 * Spec:
 *   /Users/eugeenbernan/Desktop/Outputs/AI Systems/Strategy/empire-wireframe/artifacts/B2/phase-1-spec.md
 *
 * Brand: HoistOS LIGHT mode. Paper background, signal-orange accents,
 *   editorial premium light, hairline borders, generous whitespace.
 *
 * Hard Rule #11: zero em dashes in this file. Only commas, periods, colons.
 * Hard Rule #31: Context7 disclosures emitted in coordination log before write
 *   for @react-three/fiber, drei, three, motion, lenis, lucide-react.
 */

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
  type CSSProperties,
} from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import {
  Html,
  Float,
  Environment,
  Stars,
  Sparkles as DreiSparkles,
  Trail,
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  Network,
  Wrench,
  X,
  Layers,
  Cpu,
  Compass,
  ArrowLeftRight,
} from 'lucide-react'

import {
  CATEGORY_ACCENT,
  MOCK_AHA_MOMENTS,
  type AhaMoment,
  type AhaIconKind,
} from '../empire/content/types'

import {
  FloatingDock,
  type DockItem,
} from './ui/aceternity'
import {
  NumberTicker,
  ShineBorder,
  PaperGlobe,
} from './ui/magicui'
import { Card3D } from './Card3D'

// ---------------------------------------------------------------------------
// Layout constants. Panel spacing is the Z-distance between consecutive
// panels. Camera offset is how far in front of the active panel the camera
// sits. Y / X jitter create visual rhythm without collision.
// ---------------------------------------------------------------------------

const PANEL_SPACING = 7.5
const CAMERA_Z_OFFSET = 6.2
const CAMERA_Y_OFFSET = 0.4
const RAIL_LENGTH_PADDING = 4
const WHEEL_DEBOUNCE_MS = 380

// Stagger pattern: even indexes drift up + slightly left, odd drift down +
// slightly right. Index 0 stays centered for a clean opening shot.
function panelOffset(index: number): { x: number; y: number } {
  if (index === 0) return { x: 0, y: 0 }
  const yJitter = index % 2 === 0 ? 0.55 : -0.55
  const xPattern = index % 3
  const xJitter = xPattern === 0 ? -0.65 : xPattern === 1 ? 0.65 : 0
  return { x: xJitter, y: yJitter }
}

function panelPosition(index: number): [number, number, number] {
  const { x, y } = panelOffset(index)
  return [x, y, -index * PANEL_SPACING]
}

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

export interface EmpireTimelineBProps {
  /** Aha moments to render. Falls back to MOCK_AHA_MOMENTS when omitted. */
  moments?: AhaMoment[]
  /** Brand wordmark for the persistent header. */
  brandMark?: string
  /** Tag line shown next to the brand mark. Default "Treatment B preview". */
  preview?: string
  /** Where Esc routes to. Default /empire. */
  exitHref?: string
  /** className override on the outer wrapper. */
  className?: string
}

// ---------------------------------------------------------------------------
// Default export: EmpireTimelineB
// ---------------------------------------------------------------------------

export default function EmpireTimelineB({
  moments = MOCK_AHA_MOMENTS,
  brandMark = 'HoistOS',
  preview = 'Treatment B preview',
  exitHref = '/empire',
  className = '',
}: EmpireTimelineBProps) {
  const sortedMoments = useMemo(
    () =>
      [...moments].sort((a, b) =>
        a.dateShipped.localeCompare(b.dateShipped),
      ),
    [moments],
  )

  const total = sortedMoments.length
  const [activeIndex, setActiveIndex] = useState(0)
  const lastWheelAtRef = useRef(0)

  const next = useCallback(() => {
    setActiveIndex((i) => Math.min(i + 1, Math.max(total - 1, 0)))
  }, [total])

  const prev = useCallback(() => {
    setActiveIndex((i) => Math.max(i - 1, 0))
  }, [])

  const jumpTo = useCallback(
    (idx: number) => {
      setActiveIndex(Math.max(0, Math.min(idx, total - 1)))
    },
    [total],
  )

  // Keyboard controls. Right / Space advance, Left rewinds, Esc routes out.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Escape') {
        if (typeof window !== 'undefined') window.location.assign(exitHref)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, exitHref])

  // Wheel -> snap-to-next semantics. Lenis wraps the document; this listener
  // sits on the canvas wrapper and intercepts before Lenis would scroll the
  // (zero-height) content. We debounce so a single swipe equals a single
  // panel advance.
  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const now = performance.now()
      if (now - lastWheelAtRef.current < WHEEL_DEBOUNCE_MS) return
      const delta = e.deltaY + e.deltaX
      if (Math.abs(delta) < 8) return
      lastWheelAtRef.current = now
      if (delta > 0) next()
      else prev()
    },
    [next, prev],
  )

  const activeMoment = sortedMoments[activeIndex] ?? sortedMoments[0]

  const dockItems: DockItem[] = useMemo(() => [
    {
      id: 'home',
      label: 'Vertical scroll',
      icon: <Layers size={18} />,
      href: '?treatment=a',
    },
    {
      id: 'b',
      label: 'Keynote tunnel (this)',
      icon: <Cpu size={18} />,
      active: true,
    },
    {
      id: 'c',
      label: 'Dependency graph',
      icon: <Network size={18} />,
      href: '?treatment=c',
    },
    {
      id: 'switch-dir',
      label: 'Reset to start',
      icon: <ArrowLeftRight size={18} />,
      onClick: () => jumpTo(0),
    },
    {
      id: 'exit',
      label: 'Exit to /empire',
      icon: <Compass size={18} />,
      href: exitHref,
    },
  ], [exitHref, jumpTo])

  return (
    <div
      data-theme="hoistos-light"
      onWheel={onWheel}
      className={`relative h-screen w-full overflow-hidden bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] ${className}`}
      style={{ touchAction: 'none' }}
      aria-label="Empire timeline treatment B horizontal keynote tunnel"
    >
      <PaperBackdrop />

      {/* Paper-tinted Globe in the deep background, slow rotation */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"
      >
        <PaperGlobe size={760} color="rgb(var(--color-accent))" />
      </div>

      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, CAMERA_Y_OFFSET, CAMERA_Z_OFFSET], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent
          moments={sortedMoments}
          activeIndex={activeIndex}
          onSelectIndex={jumpTo}
        />
      </Canvas>

      <HeaderBar brandMark={brandMark} preview={preview} exitHref={exitHref} />

      <ProgressFooter
        moments={sortedMoments}
        activeIndex={activeIndex}
        onJump={jumpTo}
      />

      <KeyboardHint />

      <NavButtons
        canPrev={activeIndex > 0}
        canNext={activeIndex < total - 1}
        onPrev={prev}
        onNext={next}
      />

      {/* FloatingDock for treatment-switch + reset */}
      <FloatingDock items={dockItems} />

      {/* Persistent active-card overlay rendered as HTML in front of canvas
          for typography crispness on the focused panel. Wrapped in Card3D
          for mouse-tilt + ShineBorder for the active-pulse glow. */}
      <ActiveCardOverlay moment={activeMoment} index={activeIndex} total={total} />

      {/* Lateral panel-position counter, top-right (NumberTicker animated) */}
      <PanelCounter activeIndex={activeIndex} total={total} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// PanelCounter: top-right large counter showing "<n> of <total>", animated.
// ---------------------------------------------------------------------------

function PanelCounter({
  activeIndex,
  total,
}: {
  activeIndex: number
  total: number
}) {
  return (
    <div
      className="pointer-events-none absolute right-8 top-20 z-30 hidden flex-col items-end gap-1 sm:right-12 sm:flex"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -16, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-baseline gap-2"
        >
          <span
            className="text-[64px] leading-none tabular-nums"
            style={{ color: 'rgb(var(--color-fg))' }}
          >
            <NumberTicker
              value={activeIndex + 1}
              decimals={0}
              duration={0.6}
              style={{
                fontVariantNumeric: 'tabular-nums',
              }}
            />
          </span>
          <span
            className="text-[16px] uppercase tracking-[0.22em]"
            style={{
              color: 'rgb(var(--color-fg-subtle))',
              fontFamily: 'var(--font-brand)',
            }}
          >
            of {String(total).padStart(2, '0')}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SceneContent: the R3F scene tree. Lights, rail, panels, dust particles,
// camera dolly controller. Wrapped in Suspense for any future texture loads.
// ---------------------------------------------------------------------------

interface SceneContentProps {
  moments: AhaMoment[]
  activeIndex: number
  onSelectIndex: (idx: number) => void
}

function SceneContent({ moments, activeIndex, onSelectIndex }: SceneContentProps) {
  const totalLength =
    moments.length > 0 ? (moments.length - 1) * PANEL_SPACING : 0

  return (
    <Suspense fallback={null}>
      {/* Subtle warm HDR via drei Environment "apartment" preset; gives the
          paper backdrop tone-mapped highlights without darkening it. */}
      <Environment preset="apartment" environmentIntensity={0.35} />

      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 8]} intensity={0.55} />
      <pointLight
        position={[0, 1.4, -activeIndex * PANEL_SPACING]}
        intensity={1.2}
        color="#F25A00"
        distance={8}
        decay={2}
      />

      {/* Paper-tinted stars in the deep distance */}
      <Stars
        radius={120}
        depth={50}
        count={500}
        factor={2.5}
        saturation={0}
        fade
        speed={0.4}
      />

      {/* drei Sparkles sprinkled along the rail length for premium dust */}
      <DreiSparkles
        count={64}
        scale={[6, 3, totalLength + RAIL_LENGTH_PADDING * 2]}
        position={[0, -0.4, -totalLength / 2]}
        size={3}
        speed={0.4}
        opacity={0.8}
        color="#F25A00"
      />

      <Rail length={totalLength + RAIL_LENGTH_PADDING * 2} />

      {/* Animated pin markers on the rail at each panel position */}
      {moments.map((_, idx) => (
        <RailPin key={`pin-${idx}`} index={idx} active={idx === activeIndex} />
      ))}

      {moments.map((moment, idx) => (
        <AhaPanel
          key={moment.id}
          moment={moment}
          index={idx}
          isActive={idx === activeIndex}
          totalCount={moments.length}
          onSelect={() => onSelectIndex(idx)}
        />
      ))}

      <DustField count={120} length={totalLength} />

      <CameraDolly activeIndex={activeIndex} />
      <CameraTrail activeIndex={activeIndex} />
    </Suspense>
  )
}

// ---------------------------------------------------------------------------
// CameraTrail: a small mesh that follows the camera target each frame and
// emits a Trail behind it. The Trail draws as a paper-warm orange ribbon.
// ---------------------------------------------------------------------------

function CameraTrail({ activeIndex }: { activeIndex: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame(() => {
    if (!ref.current) return
    // Sit slightly behind the camera. activeIndex is unused per-frame here
    // but kept in deps so the trail re-anchors when the user jumps.
    void activeIndex
    ref.current.position.copy(camera.position)
    ref.current.position.z += 0.6
    ref.current.position.y -= 0.2
  })

  return (
    <Trail
      width={0.6}
      length={3}
      color={'#F25A00'}
      attenuation={(t) => t * t}
    >
      <mesh ref={ref} visible={false}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#F25A00" />
      </mesh>
    </Trail>
  )
}

// ---------------------------------------------------------------------------
// RailPin: small emissive cone marker on the rail at each panel position.
// Active pin pulses + scales up; others are dim.
// ---------------------------------------------------------------------------

function RailPin({ index, active }: { index: number; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const targetScale = active ? 1.6 : 1
  const targetIntensity = active ? 1.4 : 0.3

  useFrame((_, delta) => {
    if (!ref.current) return
    const lerpAmount = 1 - Math.pow(0.0008, delta)
    const cur = ref.current.scale.x
    const next = THREE.MathUtils.lerp(cur, targetScale, lerpAmount)
    ref.current.scale.set(next, next, next)
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      targetIntensity,
      lerpAmount,
    )
  })

  const z = -index * PANEL_SPACING
  return (
    <mesh ref={ref} position={[0, -1.55, z]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.18, 0.36, 12]} />
      <meshStandardMaterial
        color={active ? '#F25A00' : '#9DB0BF'}
        emissive={'#F25A00'}
        emissiveIntensity={0.3}
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// CameraDolly: lerps the camera toward the active panel's anchor each frame.
// Camera sits CAMERA_Z_OFFSET in front of the active panel (positive Z), at
// a slight Y rise, looking toward the panel.
// ---------------------------------------------------------------------------

function CameraDolly({ activeIndex }: { activeIndex: number }) {
  const target = useMemo(() => {
    const [x, y, z] = panelPosition(activeIndex)
    return new THREE.Vector3(x * 0.45, y * 0.35 + CAMERA_Y_OFFSET, z + CAMERA_Z_OFFSET)
  }, [activeIndex])

  const lookAtTarget = useMemo(() => {
    const [x, y, z] = panelPosition(activeIndex)
    return new THREE.Vector3(x, y, z)
  }, [activeIndex])

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const { camera } = useThree()

  useFrame((_, delta) => {
    // Lerp factor approximates an ease-out spring. Frame-rate independent.
    const lerpAmount = 1 - Math.pow(0.0009, delta)
    camera.position.lerp(target, lerpAmount)
    currentLookAt.current.lerp(lookAtTarget, lerpAmount)
    camera.lookAt(currentLookAt.current)
  })

  return null
}

// ---------------------------------------------------------------------------
// Rail: extruded box along Z axis, signal-orange emissive. Sits below the
// panel midline so panels appear to float above it. Subtle inner box for a
// hairline highlight.
// ---------------------------------------------------------------------------

function Rail({ length }: { length: number }) {
  const railRef = useRef<THREE.Mesh>(null)

  // Subtle pulse on the rail's emissive intensity for liveliness without
  // distraction. 0.6 to 1.0 sine wave, 4-second period.
  useFrame(({ clock }) => {
    if (!railRef.current) return
    const mat = railRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.7 + Math.sin(clock.elapsedTime * 1.5) * 0.15
  })

  return (
    <group position={[0, -1.8, -length / 2 + RAIL_LENGTH_PADDING]}>
      {/* Main rail body */}
      <mesh ref={railRef}>
        <boxGeometry args={[0.14, 0.14, length]} />
        <meshStandardMaterial
          color="#F25A00"
          emissive="#F25A00"
          emissiveIntensity={0.85}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>
      {/* Inner highlight strip, slightly raised */}
      <mesh position={[0, 0.085, 0]}>
        <boxGeometry args={[0.05, 0.02, length]} />
        <meshBasicMaterial color="#FFE0CC" transparent opacity={0.85} />
      </mesh>
      {/* Concrete ground hint, reinforces the tunnel floor */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[3.2, 0.02, length]} />
        <meshStandardMaterial
          color="#F2F4F7"
          roughness={0.95}
          metalness={0}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// AhaPanel: a 3D plane at panel position + Drei <Html> overlay for crisp
// text. Active panel scales to 1.4 with full overlay. Inactive panels at 0.6
// with compact title + score.
// ---------------------------------------------------------------------------

interface AhaPanelProps {
  moment: AhaMoment
  index: number
  isActive: boolean
  totalCount: number
  onSelect: () => void
}

function AhaPanel({ moment, index, isActive, totalCount, onSelect }: AhaPanelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const planeRef = useRef<THREE.Mesh>(null)
  const targetScale = isActive ? 1.4 : 0.6
  const targetOpacity = isActive ? 0.96 : 0.34

  const accent =
    moment.visualHint?.accentColor ?? CATEGORY_ACCENT[moment.category]

  // Lerp scale + plane material opacity each frame for smooth focus changes.
  useFrame((_, delta) => {
    if (groupRef.current) {
      const lerpAmount = 1 - Math.pow(0.0008, delta)
      const current = groupRef.current.scale.x
      const next = THREE.MathUtils.lerp(current, targetScale, lerpAmount)
      groupRef.current.scale.set(next, next, next)
    }
    if (planeRef.current) {
      const mat = planeRef.current.material as THREE.MeshStandardMaterial
      const lerpAmount = 1 - Math.pow(0.0008, delta)
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, lerpAmount)
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        isActive ? 0.45 : 0.05,
        lerpAmount,
      )
    }
  })

  const [x, y, z] = panelPosition(index)

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    onSelect()
  }

  return (
    <Float
      speed={isActive ? 0.6 : 1.2}
      rotationIntensity={isActive ? 0.04 : 0.18}
      floatIntensity={isActive ? 0.18 : 0.4}
    >
      <group ref={groupRef} position={[x, y, z]} onClick={handleClick}>
        {/* Subtle backplate plane: white surface, accent emissive when active */}
        <mesh ref={planeRef}>
          <planeGeometry args={[3.2, 4.0]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive={new THREE.Color(accent)}
            emissiveIntensity={0.1}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Accent edge: thin border plane */}
        <mesh position={[0, 0, 0.005]}>
          <ringGeometry args={[2.05, 2.1, 4]} />
          <meshBasicMaterial color={accent} transparent opacity={isActive ? 0.55 : 0.18} />
        </mesh>

        {/* HTML compact card. Always-on; visibility / fidelity gated on
            isActive inside the panel body. Drei <Html> in transform mode
            anchors the DOM to the plane in world space. */}
        <Html
          transform
          distanceFactor={3.6}
          position={[0, 0, 0.02]}
          center
          occlude={false}
          style={{ pointerEvents: 'none' }}
        >
          <PanelCard
            moment={moment}
            accent={accent}
            isActive={isActive}
            index={index}
            total={totalCount}
            onSelect={onSelect}
          />
        </Html>
      </group>
    </Float>
  )
}

// ---------------------------------------------------------------------------
// PanelCard: HTML content shown inside the 3D panel. Compact (just title +
// score + session) when inactive, fuller card when active. The persistent
// HTML overlay above the canvas is the primary read for the focused panel,
// this in-scene card is the contextual companion.
// ---------------------------------------------------------------------------

interface PanelCardProps {
  moment: AhaMoment
  accent: string
  isActive: boolean
  index: number
  total: number
  onSelect: () => void
}

function PanelCard({ moment, accent, isActive, index, total }: PanelCardProps) {
  return (
    <div
      style={{
        width: 320,
        padding: '24px 28px',
        background: 'rgba(255, 255, 255, 0.96)',
        border: `1px solid ${isActive ? accent : '#E5E7EB'}`,
        borderRadius: 18,
        boxShadow: isActive
          ? `0 24px 60px ${accent}33, 0 0 0 1px ${accent}33 inset`
          : '0 6px 20px rgba(17, 24, 39, 0.06)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'border 240ms ease, box-shadow 240ms ease',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#6B8090',
          fontFamily: 'var(--font-brand)',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: '999px',
            background: `${accent}1A`,
            color: accent,
            fontWeight: 700,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{moment.sessionShipped}</span>
        <span aria-hidden>/</span>
        <span style={{ color: accent }}>{moment.category}</span>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: isActive ? 26 : 22,
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
          color: '#111827',
          margin: 0,
        }}
      >
        {moment.title}
      </h3>

      {isActive ? (
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            lineHeight: 1.32,
            color: accent,
            marginTop: 14,
            marginBottom: 0,
            fontStyle: 'italic',
          }}
        >
          {moment.aha}
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
          }}
        >
          <span style={{ fontSize: 11, color: '#9DB0BF', fontFamily: 'var(--font-brand)' }}>
            {String(index + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
              background: `${accent}14`,
              color: accent,
            }}
          >
            score {moment.score}
          </span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DustField: a sparse cloud of small motes drifting through the tunnel for
// depth. Pure decoration. Updates positions in useFrame for parallax feel.
// ---------------------------------------------------------------------------

function DustField({ count, length }: { count: number; length: number }) {
  const ref = useRef<THREE.Points>(null)

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4
      positions[i * 3 + 2] = -Math.random() * (length + 8) + 4
      sizes[i] = 0.4 + Math.random() * 0.8
    }
    return { positions, sizes }
  }, [count, length])

  useFrame(({ clock }) => {
    if (!ref.current) return
    // Slow Y-axis drift for parallax. Modulate by index via attribute lookup.
    const time = clock.elapsedTime
    const geo = ref.current.geometry
    const posAttr = geo.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += Math.sin(time + i) * 0.0008
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        color="#9DB0BF"
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  )
}

// ---------------------------------------------------------------------------
// PaperBackdrop: HTML layer behind the canvas. Paper-warm radial gradient
// + concrete dot grid for the brand backdrop. Slow CSS drift for parallax.
// ---------------------------------------------------------------------------

function PaperBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 45%, rgb(var(--color-accent) / 0.08) 0%, rgb(var(--color-accent) / 0.02) 40%, transparent 75%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(rgb(var(--color-fg-muted)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          animation: 'empire-tunnel-drift 80s linear infinite',
        }}
      />
      <style>{`
        @keyframes empire-tunnel-drift {
          0% { background-position: 0 0; }
          100% { background-position: 240px 0; }
        }
      `}</style>
    </>
  )
}

// ---------------------------------------------------------------------------
// HeaderBar: HoistOS mark + "Treatment B preview" tag, top-left.
// Top-right hosts the Esc-to-exit hint.
// ---------------------------------------------------------------------------

interface HeaderBarProps {
  brandMark: string
  preview: string
  exitHref: string
}

function HeaderBar({ brandMark, preview, exitHref }: HeaderBarProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-8 py-6 sm:px-12">
      <div className="pointer-events-auto flex items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-[rgb(var(--color-accent))]"
        />
        <span
          className="text-sm tracking-[0.04em]"
          style={{ fontFamily: 'var(--font-brand)', fontWeight: 600 }}
        >
          {brandMark}
        </span>
        <span className="h-3 w-px bg-[rgb(var(--color-border))]" aria-hidden />
        <span
          className="text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--color-fg-muted))]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          {preview}
        </span>
      </div>

      <a
        href={exitHref}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-[rgb(var(--color-surface))]"
        style={{
          borderColor: 'rgb(var(--color-border))',
          color: 'rgb(var(--color-fg-muted))',
          fontFamily: 'var(--font-brand)',
        }}
        aria-label="Exit to /empire"
      >
        <X size={12} />
        Esc
      </a>
    </header>
  )
}

// ---------------------------------------------------------------------------
// ProgressFooter: bottom-left, shows "N of TOTAL" with a horizontal pip rail
// users can click to jump.
// ---------------------------------------------------------------------------

interface ProgressFooterProps {
  moments: AhaMoment[]
  activeIndex: number
  onJump: (idx: number) => void
}

function ProgressFooter({ moments, activeIndex, onJump }: ProgressFooterProps) {
  return (
    <div
      className="pointer-events-none absolute bottom-8 left-8 z-30 flex items-center gap-5 sm:left-12"
      aria-hidden={false}
    >
      <div
        className="text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--color-fg-muted))]"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        {String(activeIndex + 1).padStart(2, '0')}
        <span className="mx-2 text-[rgb(var(--color-fg-subtle))]">of</span>
        {String(moments.length).padStart(2, '0')}
      </div>
      <div className="pointer-events-auto flex items-center gap-1.5">
        {moments.map((m, idx) => {
          const accent =
            m.visualHint?.accentColor ?? CATEGORY_ACCENT[m.category]
          const isActive = idx === activeIndex
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onJump(idx)}
              aria-label={`Jump to ${m.title}`}
              className="group relative flex items-center"
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 28 : 8,
                  height: 4,
                  background: isActive ? accent : 'rgba(157, 176, 191, 0.45)',
                }}
              />
              <span
                className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-[10px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  background: 'rgb(var(--color-surface-2))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-fg))',
                  fontFamily: 'var(--font-brand)',
                }}
              >
                {String(idx + 1).padStart(2, '0')} / {m.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KeyboardHint: bottom-right, persistent reminder of the controls.
// ---------------------------------------------------------------------------

function KeyboardHint() {
  return (
    <div
      className="pointer-events-none absolute bottom-8 right-8 z-30 flex items-center gap-4 sm:right-12"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      <KeyChip label="←" detail="prev" />
      <KeyChip label="→" detail="next" />
      <KeyChip label="space" detail="next" />
      <KeyChip label="esc" detail="exit" />
    </div>
  )
}

function KeyChip({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--color-fg-muted))]">
      <span
        className="inline-flex min-w-[28px] items-center justify-center rounded-md border px-1.5 py-1"
        style={{
          borderColor: 'rgb(var(--color-border))',
          background: 'rgb(var(--color-surface-2))',
          color: 'rgb(var(--color-fg))',
        }}
      >
        {label}
      </span>
      <span className="hidden sm:inline">{detail}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// NavButtons: visible chevrons centered vertically on the canvas edges. They
// give a mouse-only path to advance for users who do not realize the canvas
// supports wheel + keyboard.
// ---------------------------------------------------------------------------

interface NavButtonsProps {
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

function NavButtons({ canPrev, canNext, onPrev, onNext }: NavButtonsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous panel"
        className="pointer-events-auto absolute left-6 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition-all hover:bg-[rgb(var(--color-surface))] disabled:opacity-30"
        style={{
          borderColor: 'rgb(var(--color-border))',
          background: 'rgb(var(--color-surface-2))',
          color: 'rgb(var(--color-fg))',
        }}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next panel"
        className="pointer-events-auto absolute right-6 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border transition-all hover:bg-[rgb(var(--color-surface))] disabled:opacity-30"
        style={{
          borderColor: 'rgb(var(--color-border))',
          background: 'rgb(var(--color-surface-2))',
          color: 'rgb(var(--color-fg))',
        }}
      >
        <ChevronRight size={18} />
      </button>
    </>
  )
}

// ---------------------------------------------------------------------------
// ActiveCardOverlay: the persistent HTML card that surfaces the FULL aha
// content for the focused panel. Lives above the canvas for typography
// crispness (DM Serif Display antialiasing on a flat DOM beats
// distance-sampled WebGL text every time).
// ---------------------------------------------------------------------------

interface ActiveCardOverlayProps {
  moment: AhaMoment | undefined
  index: number
  total: number
}

function ActiveCardOverlay({ moment, index, total }: ActiveCardOverlayProps) {
  if (!moment) return null
  const accent =
    moment.visualHint?.accentColor ?? CATEGORY_ACCENT[moment.category]
  const Icon = iconForKind(moment.visualHint?.iconKind)

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={moment.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto absolute right-8 top-1/2 z-20 hidden w-full max-w-md -translate-y-1/2 lg:block"
        style={{
          fontFamily: 'var(--font-body, Inter, system-ui)',
        }}
      >
        <Card3D maxTilt={5} className="rounded-2xl">
        <ShineBorder
          borderRadius={16}
          borderWidth={1.4}
          duration={6}
          color={accent}
          color2="rgb(var(--color-accent-2))"
        >
        <div
          className="rounded-2xl border p-7"
          style={{
            borderColor: 'rgb(var(--color-border))',
            background: 'rgba(255, 255, 255, 0.94)',
            boxShadow: `0 30px 80px ${accent}1F, 0 1px 0 ${accent}26 inset`,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--color-fg-muted))]" style={{ fontFamily: 'var(--font-brand)' }}>
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              background: `${accent}1A`,
              color: accent,
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
          <span className="ml-auto" aria-hidden>{index + 1}/{total}</span>
        </div>

        <h2
          className="mt-5 text-[28px] leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'rgb(var(--color-fg))' }}
        >
          {moment.title}
        </h2>

        <p className="mt-3 text-[13px] italic leading-relaxed text-[rgb(var(--color-fg-muted))]">
          {moment.hook}
        </p>

        <OverlayField label="Before">
          <p className="text-sm leading-relaxed text-[rgb(var(--color-fg))]">
            {moment.before}
          </p>
        </OverlayField>

        <div
          className="mt-5 flex items-start gap-3 border-l-2 pl-4 py-2"
          style={{ borderColor: accent }}
        >
          <Icon size={20} style={{ color: accent, flexShrink: 0, marginTop: 4 }} />
          <p
            className="text-[20px] leading-snug"
            style={{
              fontFamily: 'var(--font-display)',
              color: accent,
            }}
          >
            {moment.aha}
          </p>
        </div>

        <OverlayField label="After">
          <p className="text-sm leading-relaxed text-[rgb(var(--color-fg))]">
            {moment.after}
          </p>
        </OverlayField>

        <div
          className="mt-4 inline-flex items-start gap-2 rounded-md border px-3 py-2 text-[12px]"
          style={{
            borderColor: accent,
            background: `${accent}0D`,
            color: 'rgb(var(--color-fg))',
          }}
        >
          <Sparkles size={13} className="mt-0.5 shrink-0" style={{ color: accent }} />
          <span>{moment.efficiency}</span>
        </div>

        <p className="mt-4 text-[11px] italic text-[rgb(var(--color-fg-muted))]">
          Foundation: {moment.foundation}
        </p>
        </div>
        </ShineBorder>
        </Card3D>
      </motion.aside>
    </AnimatePresence>
  )
}

function OverlayField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-5 flex flex-col gap-1.5">
      <span
        className="text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--color-fg-subtle))]"
        style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Local icon mapping: matches Treatment A's iconForKind contract. Re-declared
// here rather than imported so the two treatments stay loosely coupled.
// ---------------------------------------------------------------------------

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

// Named exports for downstream stories / experimentation harnesses.
export { SceneContent, AhaPanel, CameraDolly, Rail, ActiveCardOverlay }
