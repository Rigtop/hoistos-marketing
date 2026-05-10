import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Zap, Code as CodeIcon, Layers, Database, Cpu, ArrowRight } from 'lucide-react'

import { ParticleField } from './ParticleField'
import { BlurText } from './BlurText'
import { MarqueeLogos } from './MarqueeLogos'
import { GlitchText } from './GlitchText'
import { NoiseTexture } from './NoiseTexture'
import { GradientMesh } from './GradientMesh'

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="border-t py-20"
      style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}
    >
      <div className="max-w-7xl mx-auto px-[8vw]">
        <p
          className="font-mono text-xs uppercase tracking-[0.3em] mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          {label}
        </p>
        <h3 className="font-display text-4xl md:text-5xl mb-12 leading-tight">{title}</h3>
        {children}
      </div>
    </motion.section>
  )
}

export function EliteShowcase() {
  const [cursorOn, setCursorOn] = useState(false)

  return (
    <div>
      {/* PARTICLE FIELD */}
      <Section label="08 · ParticleField" title="A network. Cursor pushes it.">
        <div className="card relative !p-12 min-h-[360px] overflow-hidden">
          <ParticleField count={70} />
          <div className="relative z-10 max-w-xl">
            <p className="font-display text-3xl md:text-4xl leading-tight mb-3">
              Move your cursor across this card.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Vanilla canvas. ~120 lines, zero deps. Particles drift, link to neighbors,
              and gently repel from the cursor. Theme-aware via CSS vars.
            </p>
          </div>
        </div>
      </Section>

      {/* GRADIENT MESH */}
      <Section label="09 · GradientMesh" title="Five blobs of color. One depth.">
        <div className="relative card !p-12 min-h-[320px] overflow-hidden">
          <GradientMesh />
          <NoiseTexture opacity={0.06} />
          <div className="relative z-10 max-w-xl">
            <p className="font-display text-3xl md:text-4xl leading-tight mb-3">
              The 2026 vibe: glow, blur, noise.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              GradientMesh + NoiseTexture overlay. Heavier than AuroraOrbs (5 vs 3 blobs,
              more saturation). Pair with NoiseTexture for that filmic-grain finish.
            </p>
          </div>
        </div>
      </Section>

      {/* BLUR TEXT */}
      <Section label="10 · BlurText" title="Words land like film cells.">
        <div className="card !p-12">
          <h4 className="font-display text-5xl md:text-6xl leading-tight mb-6">
            <BlurText text="Studio-grade visuals on demand." stagger={0.04} blur={10} />
          </h4>
          <p className="text-sm font-light max-w-2xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Character-by-character blur reveal on viewport entry. Codrops / react-bits scroll-reveal
            text pattern. Use sparingly on big section titles.
          </p>
        </div>
      </Section>

      {/* GLITCH TEXT */}
      <Section label="11 · GlitchText" title="Hover the word. Watch it tear.">
        <div className="card !p-12 text-center">
          <h4 className="font-display text-6xl md:text-8xl leading-tight">
            We <GlitchText text="ship" mode="hover" /> daily.
          </h4>
          <p className="text-sm font-light mt-6" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Pure CSS clip-path glitch on three RGB-shifted layers. Hover the word "ship" above.
          </p>
        </div>
      </Section>

      {/* MARQUEE LOGOS */}
      <Section label="12 · MarqueeLogos" title="Trusted by. Talked about by.">
        <div className="card !p-8">
          <MarqueeLogos
            duration={30}
            items={[
              { label: 'HoistOS', icon: <Sparkles size={18} strokeWidth={1.5} /> },
              { label: 'Perennial Empire', icon: <Cpu size={18} strokeWidth={1.5} /> },
              { label: 'EmpireWorks', icon: <Layers size={18} strokeWidth={1.5} /> },
              { label: 'Anthropic Claude', icon: <Database size={18} strokeWidth={1.5} /> },
              { label: 'Studio Freight', icon: <Zap size={18} strokeWidth={1.5} /> },
              { label: 'Active Theory', icon: <CodeIcon size={18} strokeWidth={1.5} /> },
              { label: 'Codrops', icon: <ArrowRight size={18} strokeWidth={1.5} /> },
              { label: 'Awwwards', icon: <Sparkles size={18} strokeWidth={1.5} /> },
            ]}
          />
          <p className="text-sm font-light text-center mt-6" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Pure CSS marquee with edge-fade mask + pause-on-hover. Bidirectional via prop.
          </p>
        </div>
      </Section>

      {/* CUSTOM CURSOR TOGGLE */}
      <Section label="13 · CustomCursor" title="Browser cursor, replaced.">
        <div className="card !p-12 text-center">
          <p className="font-display text-3xl md:text-4xl leading-tight mb-6">
            <BlurText text="Toggle to swap your cursor for the visual-stack version." />
          </p>
          <button
            onClick={() => {
              setCursorOn((c) => !c)
              const root = document.documentElement
              if (cursorOn) {
                root.removeAttribute('data-custom-cursor')
              } else {
                root.setAttribute('data-custom-cursor', 'on')
              }
            }}
            className="btn btn-primary"
            data-cursor="hover"
          >
            {cursorOn ? 'Restore browser cursor' : 'Activate custom cursor'}
            <ArrowRight size={16} />
          </button>
          <p className="text-xs font-mono mt-6" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
            Note: hidden on touch devices. Magnetically scales on [data-cursor="hover"], a, button.
          </p>
        </div>
      </Section>
    </div>
  )
}
