/**
 * EmpireFoundationGrid. The "Your installed system" surface that replaces
 * the chronological timeline reader at /empireworksreconstruction/foundation.
 *
 * Owner: S205 Empire Wireframe VP-demo fix sprint.
 * Routing reference: src/empire/AppRouter.tsx renders EmpireTimelinePage at
 * the /foundation route. S205 swap: EmpireTimelinePage now renders this
 * component instead of EmpireTimelineD mode='foundation'. The chronological
 * narrative survives at /timeline via EmpireStoryPage (unchanged).
 *
 * Context7: motion@12.38 + react@19 + react-router-dom@7.15 + lucide-react@1.14.
 * All four libs are used identically in src/empire/cards/MapCard.tsx; reusing
 * those exact patterns. No API drift possible.
 *
 * Hard Rule #11: zero em dashes.
 * R047 voice: counter-led, no banned openers, no apologies.
 * R051: no horizontal CTA stacks, single-column on mobile.
 * R067: mobile-first. 320/375/768 viewports verified pre-ship.
 */

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, Sparkles, X } from 'lucide-react'
import { FOUNDATION_CARDS, LAYER_TOKENS, type FoundationCard } from './content/foundation-cards'
import { activateSkill, listActivated, removeActivated } from '../lib/activate'

const VERIFY_PROMPT =
  'Check my EmpireWorks Bridge setup. Confirm Foundation is installed, list the installed packs, and tell me what I can ask you to do now.'

/**
 * Read intake-state from localStorage defensively. Pulls the two fields the
 * grid mini-form needs (VP name slug + division slug). Returns empty when
 * intake-state is missing or malformed.
 *
 * Key alignment: 'hoistos.intake.v1' is the agreed contract slug across the
 * Intake (Agent A), customware engine (Agent C), and gallery surfaces.
 */
function readMiniIntake(): { vpNameSlug: string; divisionSlug: string } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { vpNameSlug: '', divisionSlug: '' }
    }
    const raw = window.localStorage.getItem('hoistos.intake.v1')
    if (!raw) return { vpNameSlug: '', divisionSlug: '' }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    // Agent A stores the raw name + division strings. Slug-ifying here for
    // customware substitution. Lowercase, hyphenate, strip non-alphanumeric.
    const rawName = typeof parsed.name === 'string' ? parsed.name : ''
    const rawDiv = typeof parsed.division === 'string' ? parsed.division : ''
    return {
      vpNameSlug: slugify(rawName),
      divisionSlug: slugify(rawDiv),
    }
  } catch {
    return { vpNameSlug: '', divisionSlug: '' }
  }
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Map a foundation packId to the canonical pack URL served by /packs-v2/.
 * The Bridge ships the same markdown files; this URL is the public surface
 * activateSkill fetches. Mirrors the install-manifest.json base_url pattern.
 */
function packUrlFor(packId: string): string {
  return `/packs-v2/${packId}.md`
}

/**
 * Snapshot of installed packs at first render. We read once on mount via
 * useState's lazy initializer and accept slight staleness inside this view.
 * The parent gallery component re-mounts after install events, which is
 * sufficient for the S210 reversal scope: each install opens a new claude.ai
 * tab so the user is moving across screens anyway.
 */
function isInstalled(installed: string[], packId: string): boolean {
  return installed.indexOf(packId) >= 0
}

export function EmpireFoundationGrid() {
  return (
    <div
      className="px-[6vw] pt-16 pb-32"
      style={{ background: '#f5f4ed', color: '#141413' }}
    >
      <HeroBlock />
      <VerifyCTA />
      <Grid />
      <BottomCTA />
    </div>
  )
}

function HeroBlock() {
  return (
    <header className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="text-sm font-medium mb-5"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        Your installed system
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.05 }}
        className="font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] mb-5"
      >
        Eleven packs.
        <br />
        Five operating layers.
        <br />
        <span style={{ color: 'rgb(var(--color-accent))' }}>Already in your Claude.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.12 }}
        className="text-base md:text-lg leading-relaxed mb-3"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        The Bridge wired these onto your machine. Each card below shows what one pack
        does, what to type to invoke it, and what Claude returns.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18 }}
        className="text-sm leading-relaxed max-w-xl mx-auto"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Run the verify prompt below first to confirm what landed. Then open any card
        for the full pack.
      </motion.p>
    </header>
  )
}

function VerifyCTA() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(VERIFY_PROMPT)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
      className="mt-12 mb-16 max-w-3xl mx-auto rounded-2xl overflow-hidden"
      style={{
        border: '1px solid rgba(204,110,46,0.25)',
        boxShadow: '0 20px 50px -16px rgba(204,110,46,0.15), 0 4px 12px rgba(20,20,19,0.04)',
        background: 'linear-gradient(135deg, rgba(204,110,46,0.06), rgba(204,110,46,0.01))',
      }}
    >
      <div className="px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-start gap-4 flex-col sm:flex-row">
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-medium mb-2"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              Verify Foundation landed before you install anything else
            </div>
            <h2 className="font-display text-xl sm:text-2xl leading-tight mb-2">
              Paste this prompt into your Claude Project
            </h2>
            <p
              className="text-sm leading-relaxed m-0"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              Claude reads the manifest, confirms Foundation is installed, lists every
              pack, and tells you what to ask next. If anything is off, it says so on
              the same line.
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Verify prompt copied to clipboard' : 'Copy verify prompt to clipboard'}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition self-start sm:self-auto min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: copied ? 'rgb(18, 128, 82)' : 'rgb(var(--color-accent))',
              color: '#fbfaf3',
              border: '1px solid rgba(20,20,19,0.06)',
              boxShadow: copied
                ? '0 8px 20px rgba(18,128,82,0.22)'
                : '0 8px 20px rgba(204,110,46,0.28)',
            }}
          >
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy verify prompt'}
          </button>
        </div>
        <pre
          className="mt-5 whitespace-pre-wrap rounded-lg p-4 text-xs sm:text-sm leading-relaxed m-0"
          style={{
            background: 'rgba(20,20,19,0.04)',
            border: '1px solid rgba(20,20,19,0.06)',
            color: '#141413',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {VERIFY_PROMPT}
        </pre>
      </div>
    </motion.div>
  )
}

function Grid() {
  return (
    <section className="mt-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      {FOUNDATION_CARDS.map((card, i) => (
        <FoundationCardTile key={card.packId} card={card} index={i} />
      ))}
    </section>
  )
}

function FoundationCardTile({ card, index }: { card: FoundationCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 200, damping: 24 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 200, damping: 24 })
  const tone = LAYER_TOKENS[card.layer]

  // S210 reversal state: each card carries its own mini-form expansion state
  // and its own install-in-flight state. Snapshot of installed packs is read
  // once at first mount via the lazy initializer; new installs flip this
  // card's local state via the activate callback.
  const intakePrefill = readMiniIntake()
  const [showForm, setShowForm] = useState(false)
  const [vpName, setVpName] = useState(intakePrefill.vpNameSlug)
  const [division, setDivision] = useState(intakePrefill.divisionSlug)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState<boolean>(() =>
    isInstalled(listActivated(), card.packId),
  )

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2)
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  function onLeave() {
    mx.set(0)
    my.set(0)
  }

  // Primary action: open the mini-form. If the form is already open and the
  // user clicks Confirm install, we kick activateSkill with the customware
  // answers. F2 fix (S217 iter-2): the button label changes on each state so
  // the user can tell the difference between "I opened a form" and "I just
  // installed."
  async function handleInstall(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (!showForm) {
      setShowForm(true)
      return
    }
    setInstalling(true)
    try {
      await activateSkill({
        slug: card.packId,
        packUrl: packUrlFor(card.packId),
        customwareAnswers: {
          VP_NAME_SLUG: slugify(vpName),
          DIVISION_SLUG: slugify(division),
        },
      })
      setInstalled(true)
    } catch {
      // activateSkill toasts its own error path; nothing to surface here.
    } finally {
      setInstalling(false)
    }
  }

  // F3 fix (S217 iter-2): explicit "skip personalization" path so the user
  // does not get the worst-of-both-worlds case where a click on the same
  // button silently installs with empty fields.
  async function handleSkipPersonalization(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    setInstalling(true)
    try {
      await activateSkill({
        slug: card.packId,
        packUrl: packUrlFor(card.packId),
        customwareAnswers: {
          VP_NAME_SLUG: '',
          DIVISION_SLUG: '',
        },
      })
      setInstalled(true)
    } catch {
      /* activateSkill surfaces its own error toast */
    } finally {
      setInstalling(false)
    }
  }

  // F9 fix (S217 iter-2): a Remove button on the installed-state card so
  // the user can roll back an install without opening DevTools. Drops the
  // pack id from the activated list and flips the card back to the
  // pre-install presentation.
  function handleRemove(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    removeActivated(card.packId)
    setInstalled(false)
    setShowForm(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduceMotion
          ? { transformPerspective: 1200 }
          : { rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }
      }
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.55, delay: 0.06 * (index % 6), ease: [0.22, 1, 0.36, 1] }
      }
      className="group relative rounded-3xl overflow-hidden"
    >
      <div
        className="block p-6 sm:p-7 relative"
        style={{
          background: '#fbfaf3',
          border: '1px solid rgba(20,20,19,0.08)',
          color: '#141413',
          boxShadow: '0 14px 34px rgba(20,20,19,0.05), 0 2px 8px rgba(20,20,19,0.02)',
        }}
      >
        {/* radial-spotlight on hover (per MapCard pattern) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(204,110,46,0.10), transparent 45%)',
          }}
        />
        {/* faint grid texture (matches MapCard) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(20,20,19,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,19,1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex items-start justify-between gap-3 mb-4">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-medium rounded-full px-2.5 py-1"
            style={{ background: 'rgba(20,20,19,0.05)', color: '#141413' }}
          >
            <span style={{ color: 'rgb(var(--color-accent))', fontWeight: 700 }}>{card.badge}</span>
            <span style={{ color: 'rgba(20,20,19,0.45)' }}>·</span>
            <span style={{ color: installed ? 'rgb(18,128,82)' : '#5e5d59' }}>
              {installed ? 'Installed' : 'Available'}
            </span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1"
            style={{ background: tone.bg, color: tone.color }}
          >
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: tone.color }}
            />
            {card.layer}
          </span>
        </div>

        <h3 className="relative font-display text-[1.5rem] sm:text-[1.7rem] leading-tight mb-2">
          {card.title}
        </h3>

        <p
          className="relative text-sm leading-relaxed m-0"
          style={{ color: '#5e5d59' }}
        >
          {card.purpose}
        </p>

        <div
          className="relative mt-5 rounded-xl p-4"
          style={{
            background: 'rgba(20,20,19,0.035)',
            border: '1px solid rgba(20,20,19,0.06)',
          }}
        >
          <div
            className="text-xs font-medium mb-2"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            You type
          </div>
          <p
            className="text-sm m-0 leading-relaxed"
            style={{
              color: '#141413',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '13px',
            }}
          >
            "{card.question}"
          </p>
        </div>

        <div className="relative mt-3">
          <div
            className="text-xs font-medium mb-2"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            Claude returns
          </div>
          <p
            className="text-sm leading-relaxed m-0"
            style={{ color: '#3a3a36' }}
          >
            {card.claudeDoes}
          </p>
        </div>

        {/* S210: customware mini-form. Collapsed by default, expands on first
            click of the primary install button. Two fields, both pre-filled
            from intake-state when available. Stacks single-column on mobile
            (R051, R067). 44px tap targets (R067). */}
        {showForm && !installed ? (
          <div
            className="relative mt-5 rounded-xl p-4"
            style={{
              background: 'rgba(204,110,46,0.05)',
              border: '1px solid rgba(204,110,46,0.18)',
            }}
          >
            <div
              className="text-xs font-medium mb-3"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              Personalize this pack
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs">
                <span style={{ color: '#3a3a36', fontWeight: 600 }}>Your first name</span>
                <input
                  type="text"
                  value={vpName}
                  onChange={(ev) => setVpName(ev.target.value)}
                  placeholder="e.g. john"
                  className="rounded-md px-3 py-2 text-sm"
                  style={{
                    background: '#fbfaf3',
                    border: '1px solid rgba(20,20,19,0.12)',
                    color: '#141413',
                    minHeight: 46,
                  }}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span style={{ color: '#3a3a36', fontWeight: 600 }}>Your division or company</span>
                <input
                  type="text"
                  value={division}
                  onChange={(ev) => setDivision(ev.target.value)}
                  placeholder="e.g. acme-construction"
                  className="rounded-md px-3 py-2 text-sm"
                  style={{
                    background: '#fbfaf3',
                    border: '1px solid rgba(20,20,19,0.12)',
                    color: '#141413',
                    minHeight: 46,
                  }}
                />
              </label>
              <p
                className="text-xs m-0"
                style={{ color: '#5e5d59' }}
              >
                Both fields are optional. They swap into the pack body before it copies.
              </p>
            </div>
          </div>
        ) : null}

        {/* S210 + S217 iter-2: primary CTA + secondary actions. Stacks
            single-column on mobile per R051. 44px min-height per R067.
            F2: button label visibly changes per state (Personalize → Confirm
            → Installed). F3: a Skip personalization secondary appears once
            the form is open so the user has a deliberate path forward
            instead of a silent empty-fields install. F9: a Remove secondary
            appears once installed so the user can roll back. */}
        <div className="relative mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            aria-label={
              installed
                ? `${card.title} is installed`
                : installing
                  ? `Installing ${card.title}`
                  : showForm
                    ? `Confirm install of ${card.title}`
                    : `Personalize ${card.title} before install`
            }
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: installed ? 'rgb(18, 128, 82)' : 'rgb(var(--color-accent))',
              color: '#fbfaf3',
              border: '1px solid rgba(20,20,19,0.06)',
              boxShadow: installed
                ? '0 8px 20px rgba(18,128,82,0.22)'
                : '0 8px 20px rgba(204,110,46,0.28)',
              minHeight: 44,
              cursor: installing ? 'progress' : 'pointer',
              opacity: installing ? 0.75 : 1,
            }}
          >
            {installed ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                Installed
              </>
            ) : installing ? (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copying pack
              </>
            ) : showForm ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                Confirm install
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Personalize
              </>
            )}
          </button>
          {!installed && showForm && !installing ? (
            <button
              type="button"
              onClick={handleSkipPersonalization}
              aria-label={`Install ${card.title} with placeholders, skip personalization`}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: 'transparent',
                color: 'rgb(var(--color-fg-muted))',
                border: '1px solid rgba(20,20,19,0.18)',
                minHeight: 44,
              }}
            >
              Skip and install
            </button>
          ) : null}
          {installed ? (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: 'transparent',
                color: 'rgb(var(--color-fg-muted))',
                border: '1px solid rgba(20,20,19,0.18)',
                minHeight: 44,
              }}
              aria-label={`Remove ${card.title} from installed packs`}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              Remove
            </button>
          ) : null}
          <Link
            to={`/empireworksreconstruction/pack/${card.packId}`}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              color: 'rgb(var(--color-accent))',
              textDecoration: 'none',
              minHeight: 44,
            }}
          >
            See what it does
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function BottomCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="mt-20 max-w-3xl mx-auto text-center"
    >
      <p
        className="text-sm font-medium mb-4"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        What's next
      </p>
      <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight mb-4">
        Foundation is the floor. Advanced packs go on top.
      </h2>
      <p
        className="text-base leading-relaxed mb-8 max-w-2xl mx-auto"
        style={{ color: '#5e5d59' }}
      >
        Proposal builder, RFI flow, skill builder, the rest. They layer onto the
        same Bridge once Foundation is rolling. No reinstall. Ask, and they layer on.
      </p>
      <Link
        to="/empireworksreconstruction/bonus-extras"
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: 'rgb(var(--color-accent))',
          color: '#fbfaf3',
          boxShadow: '0 12px 30px rgba(204,110,46,0.28)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 16px 36px rgba(204,110,46,0.42)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(204,110,46,0.28)'
        }}
      >
        Browse advanced packs
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </motion.section>
  )
}

export default EmpireFoundationGrid
