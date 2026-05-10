import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, PartyPopper, CheckCircle, Info } from 'lucide-react'

import { ScrollProgressBar } from './ScrollProgressBar'
import { Confetti } from './Confetti'
import { ImageLightbox } from './ImageLightbox'
import { ToastProvider, useToast } from './Toast'
import { StickyHorizontalScroll } from './StickyHorizontalScroll'
import { LiquidHover } from './webgl/LiquidHover'
import { useViewTransition } from './view-transitions/useViewTransition'

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="border-t py-20"
      style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}
    >
      <div className="max-w-7xl mx-auto px-[8vw]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
          {label}
        </p>
        <h3 className="font-display text-4xl md:text-5xl mb-12 leading-tight">{title}</h3>
        {children}
      </div>
    </motion.section>
  )
}

const SAMPLE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop'

function ToastDemoButtons() {
  const { show } = useToast()
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={() => show({ kind: 'success', title: 'Saved', description: 'All good. The thing landed.' })}
        className="btn btn-primary"
        data-cursor="hover"
      >
        <CheckCircle size={16} /> Success toast
      </button>
      <button
        onClick={() => show({ kind: 'error', title: 'Something broke', description: 'Try again or check the logs.' })}
        className="btn btn-ghost"
        data-cursor="hover"
      >
        Error toast
      </button>
      <button
        onClick={() => show({ kind: 'info', title: 'Heads up', description: 'A thing you should know.' })}
        className="btn btn-ghost"
        data-cursor="hover"
      >
        <Info size={16} /> Info toast
      </button>
    </div>
  )
}

function ViewTransitionDemo() {
  const [page, setPage] = useState<'a' | 'b' | 'c'>('a')
  const transition = useViewTransition()

  const pages = {
    a: { title: 'Page A', body: 'Default landing.', accent: 'rgb(var(--color-accent))' },
    b: { title: 'Page B', body: 'Native browser route morph.', accent: 'rgb(var(--color-accent-2))' },
    c: { title: 'Page C', body: 'No JS animation library required.', accent: 'rgb(var(--color-fg-subtle))' },
  } as const

  function go(p: typeof page) {
    transition(() => setPage(p))
  }

  return (
    <div className="card !p-12">
      <div
        style={{
          viewTransitionName: 'pagebox',
          background: pages[page].accent,
          color: 'rgb(var(--color-bg))',
        }}
        className="rounded-2xl p-8 mb-6 text-center"
      >
        <h4 className="font-display text-3xl mb-2">{pages[page].title}</h4>
        <p className="text-sm font-light">{pages[page].body}</p>
      </div>
      <div className="flex gap-2 justify-center">
        {(['a', 'b', 'c'] as const).map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className={`btn ${page === p ? 'btn-primary' : 'btn-ghost'}`}
            data-cursor="hover"
          >
            Go to {p.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="text-xs font-mono mt-6 text-center" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
        Native View Transitions API. Chrome + Safari. Falls back to plain swap when unsupported.
      </p>
    </div>
  )
}

export function PolishShowcase() {
  const [confettiTrigger, setConfettiTrigger] = useState(0)

  return (
    <ToastProvider>
      <ScrollProgressBar position="top" />
      <Confetti trigger={confettiTrigger} />

      <Section label="23 · ScrollProgressBar" title="Pinned to the top. Fills as you scroll.">
        <p className="text-base font-light max-w-2xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Look up. The orange bar at the top of the viewport is filling as you read. Spring-smoothed
          via Motion useSpring. Theme-aware accent gradient with glow.
        </p>
      </Section>

      <Section label="24 · Confetti · physics" title="Click. Celebrate.">
        <div className="card !p-12 text-center">
          <button
            onClick={() => setConfettiTrigger(Date.now())}
            className="btn btn-primary"
            data-cursor="hover"
          >
            <PartyPopper size={16} /> Fire confetti
          </button>
          <p className="text-sm font-light mt-6 max-w-xl mx-auto" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Pure canvas particle burst. Gravity + drag + rotation per particle. Three shapes
            (squares, circles, strips). Theme-aware palette.
          </p>
        </div>
      </Section>

      <Section label="25 · ImageLightbox · click to expand" title="Apple-style zoom morph.">
        <div className="grid md:grid-cols-3 gap-4">
          <ImageLightbox src={SAMPLE} alt="Sample" caption="Click to expand. Esc to close." />
          <ImageLightbox
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&auto=format&fit=crop"
            alt="Sample 2"
            caption="Shared-element morph via Motion layoutId."
          />
          <ImageLightbox
            src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1600&auto=format&fit=crop"
            alt="Sample 3"
            caption="Body scroll locked while open."
          />
        </div>
      </Section>

      <Section label="26 · ToastSystem · SPA notifications" title="Stacked, springy, dismissable.">
        <div className="card !p-12 text-center">
          <ToastDemoButtons />
          <p className="text-sm font-light mt-6 max-w-xl mx-auto" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Provider + useToast() hook + auto-dismiss with progress bar + spring entry/exit. Three
            kinds: success / error / info. Lives bottom-right of the viewport.
          </p>
        </div>
      </Section>

      <Section label="27 · LiquidHover · WebGL polar warp" title="Hover. Watch it ripple.">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <LiquidHover src={SAMPLE} alt="Liquid hover sample" />
          <div>
            <p className="text-base leading-relaxed font-light mb-4" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Sister to DistortionImage. Polar-coordinate fragment shader: sin warp on radius
              creates a ripple, sin swirl on angle adds a twist, slight chromatic split inside the
              distortion zone. The "liquid" feel that DistortionImage's bend can't reach.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              Use case: portfolio cases, product hero shots, anything where the image earns more
              attention by becoming reactive.
            </p>
          </div>
        </div>
      </Section>

      <Section label="28 · ViewTransitions · native morph" title="Browser-native route swaps.">
        <ViewTransitionDemo />
      </Section>

      <section className="border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
        <div className="px-[8vw] pt-20 pb-6 max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
            29 · StickyHorizontalScroll · Apple-style
          </p>
          <h3 className="font-display text-4xl md:text-5xl leading-tight mb-3">Scroll down. Move sideways.</h3>
          <p className="text-sm font-light max-w-xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Pinned viewport, horizontal track translates as you scroll vertically. AirPods page pattern.
          </p>
        </div>
        <StickyHorizontalScroll scrollLength={4}>
          {[
            { num: '01', title: 'Scroll', body: 'Vertical scroll drives horizontal motion.' },
            { num: '02', title: 'Lands', body: 'Each panel fills the viewport.' },
            { num: '03', title: 'Smooth', body: 'Motion + Lenis combine for buttery feel.' },
            { num: '04', title: 'Done', body: 'Final panel exits to next section.' },
          ].map((p) => (
            <div key={p.num} className="card !p-16 text-center max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'rgb(var(--color-accent))' }}>
                {p.num}
              </p>
              <h4 className="font-display text-5xl md:text-7xl leading-tight mb-4">{p.title}</h4>
              <p className="text-base font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {p.body}
              </p>
            </div>
          ))}
        </StickyHorizontalScroll>
      </section>

      <Section label="Wired in App.tsx" title="ToastProvider + ScrollProgressBar + Confetti.">
        <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          The provider, scroll bar, and confetti canvas all sit at the App root. Any component
          beneath can fire toasts via <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgb(var(--color-surface-2))' }}>useToast()</code> or trigger confetti by bumping a state value.
          See bottom-right of the viewport for stacked toasts.
        </p>
        <p className="text-sm font-light mt-4 text-center max-w-2xl mx-auto pt-8 border-t" style={{ color: 'rgb(var(--color-fg-subtle))', borderColor: 'rgb(var(--color-border) / 0.2)' }}>
          That's the visual-stack v1.4: 40 components, 10 sections, 1 skill.
          <br />Press <ArrowRight size={14} className="inline align-middle" /> to start a real deliverable: <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgb(var(--color-surface-2))' }}>/visualize-pro &lt;name&gt;</code>
        </p>
      </Section>
    </ToastProvider>
  )
}
