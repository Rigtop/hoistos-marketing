import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  { num: '01', label: 'Foundation', body: 'React + Vite + TypeScript + Tailwind + shadcn/ui. The base every component sits on.' },
  { num: '02', label: 'Motion', body: 'Motion (formerly Framer Motion) for declarative React transitions. GSAP + ScrollTrigger for cinema-grade scroll choreography.' },
  { num: '03', label: 'Flair', body: 'Aceternity UI + Magic UI + react-bits — copy-paste high-end components. Spotlights, 3D cards, bento grids.' },
  { num: '04', label: '3D when needed', body: 'React Three Fiber + Drei. Spline for visual-editor 3D. Rive for interactive vector animations.' },
  { num: '05', label: 'Brand presets', body: 'Two Tailwind themes ship in the template: HoistOS bold + Anthropic Claude warm parchment. Swap in one click.' },
]

/**
 * ScrollSection — GSAP ScrollTrigger demo.
 * Each row fades + slides in as it enters the viewport.
 * Animations run outside React's reconciler (no jank under heavy state).
 */
export function ScrollSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.scroll-row').forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="px-[8vw] py-32 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'rgb(var(--color-accent))' }}>
          Five tiers · battle-tested 2026
        </p>
        <h2 className="font-display text-5xl md:text-7xl leading-tight tracking-tight mb-20 text-fg">
          What's in the{' '}
          <em className="not-italic" style={{ color: 'rgb(var(--color-accent))' }}>
            stack
          </em>
          .
        </h2>

        <div className="space-y-2">
          {ITEMS.map((item) => (
            <div
              key={item.num}
              className="scroll-row group grid grid-cols-[80px_220px_1fr] gap-8 items-start py-8 border-t"
              style={{ borderColor: 'rgb(var(--color-border) / 0.15)' }}
            >
              <span
                className="font-mono text-sm pt-1"
                style={{ color: 'rgb(var(--color-accent))' }}
              >
                {item.num}
              </span>
              <h3 className="font-display text-3xl md:text-4xl leading-none text-fg">{item.label}</h3>
              <p className="text-base md:text-lg leading-relaxed font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
