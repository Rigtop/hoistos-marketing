import { useRef } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Zap, Layers, ArrowRight, Cpu, Database } from 'lucide-react'

import { Spotlight } from './Spotlight'
import { BentoGrid, BentoItem } from './BentoGrid'
import { Card3D } from './Card3D'
import { AnimatedBeam } from './AnimatedBeam'
import { BorderBeam } from './BorderBeam'
import { GradientText } from './GradientText'
import { TypewriterText } from './TypewriterText'
import { MagneticButton } from './MagneticButton'

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

export function LibraryShowcase() {
  const beamRef = useRef<HTMLDivElement>(null!)
  const node1Ref = useRef<HTMLDivElement>(null!)
  const node2Ref = useRef<HTMLDivElement>(null!)
  const node3Ref = useRef<HTMLDivElement>(null!)

  return (
    <div>
      {/* SPOTLIGHT */}
      <Section label="01 · Spotlight" title="Cursor follows. Light follows.">
        <Spotlight className="card !p-12 min-h-[280px] flex items-center justify-center" size={420}>
          <div className="text-center">
            <p className="font-display text-3xl md:text-5xl leading-tight mb-3">
              Move your cursor across this card.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Spotlight is a cursor-following radial gradient overlay. Theme-aware via CSS vars.
            </p>
          </div>
        </Spotlight>
      </Section>

      {/* BENTO GRID */}
      <Section label="02 · BentoGrid" title="Asymmetric layouts that earn their space.">
        <BentoGrid>
          <BentoItem
            span="huge"
            title="The hero block"
            description="Two columns, two rows. Anchor the layout with one big idea."
            icon={<Sparkles size={20} strokeWidth={1.5} />}
          />
          <BentoItem
            title="Wide stat"
            description="One column. Standard cell."
            icon={<Zap size={20} strokeWidth={1.5} />}
          />
          <BentoItem
            title="Standard"
            description="The most common cell. Fill it with anything."
            icon={<Layers size={20} strokeWidth={1.5} />}
          />
          <BentoItem
            span="wide"
            title="Wide section"
            description="Two columns. Use for charts, tables, or spanning text."
            icon={<Database size={20} strokeWidth={1.5} />}
          />
          <BentoItem
            title="Last cell"
            description="Standard. Closes out the grid."
            icon={<Cpu size={20} strokeWidth={1.5} />}
          />
        </BentoGrid>
      </Section>

      {/* CARD 3D */}
      <Section label="03 · Card3D" title="Cards that respond to your hand.">
        <div className="grid md:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
          {[
            { num: '01', title: 'Mouse-follow tilt', body: 'Spring-damped rotation tracks your cursor. Inertia on leave.' },
            { num: '02', title: 'Theme-aware', body: 'Same component. Two brand voices. Hover either to feel the difference.' },
            { num: '03', title: 'Production-ready', body: 'No janky transforms. Reduced-motion users get a flat card.' },
          ].map((c) => (
            <Card3D key={c.num} className="!p-8">
              <span className="font-mono text-xs" style={{ color: 'rgb(var(--color-accent))' }}>
                {c.num}
              </span>
              <h4 className="font-display text-2xl mt-3 mb-2 leading-tight">{c.title}</h4>
              <p className="text-sm leading-relaxed font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {c.body}
              </p>
            </Card3D>
          ))}
        </div>
      </Section>

      {/* ANIMATED BEAM */}
      <Section label="04 · AnimatedBeam" title="Diagrams that feel alive.">
        <div ref={beamRef} className="relative card !p-12 min-h-[320px] flex items-center justify-around overflow-hidden">
          <div ref={node1Ref} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgb(var(--color-surface-2))', border: '1px solid rgb(var(--color-accent) / 0.3)' }}
            >
              <Cpu size={28} style={{ color: 'rgb(var(--color-accent))' }} strokeWidth={1.5} />
            </div>
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              Code
            </span>
          </div>
          <div ref={node2Ref} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgb(var(--color-accent))', boxShadow: '0 0 32px rgb(var(--color-accent) / 0.4)' }}
            >
              <Sparkles size={32} style={{ color: 'rgb(var(--color-bg))' }} strokeWidth={1.5} />
            </div>
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--color-accent))' }}>
              Brain
            </span>
          </div>
          <div ref={node3Ref} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgb(var(--color-surface-2))', border: '1px solid rgb(var(--color-accent) / 0.3)' }}
            >
              <Database size={28} style={{ color: 'rgb(var(--color-accent))' }} strokeWidth={1.5} />
            </div>
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              Memory
            </span>
          </div>
          <AnimatedBeam containerRef={beamRef} fromRef={node1Ref} toRef={node2Ref} curvature={-60} />
          <AnimatedBeam containerRef={beamRef} fromRef={node2Ref} toRef={node3Ref} curvature={60} duration={4} />
        </div>
      </Section>

      {/* BORDER BEAM */}
      <Section label="05 · BorderBeam" title="Highlight cards. Make them pulse.">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card relative !p-8">
            <BorderBeam size={28} duration={5} />
            <span className="font-mono text-xs" style={{ color: 'rgb(var(--color-accent))' }}>
              Featured
            </span>
            <h4 className="font-display text-3xl mt-3 mb-3 leading-tight">
              Rotating gradient border
            </h4>
            <p className="text-sm leading-relaxed font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              A conic gradient travels around the card edge. Use it sparingly — one card per section. The
              eye locks on it first.
            </p>
          </div>
          <div className="card !p-8">
            <span className="font-mono text-xs" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              Standard
            </span>
            <h4 className="font-display text-3xl mt-3 mb-3 leading-tight">No beam.</h4>
            <p className="text-sm leading-relaxed font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Compare side-by-side. The beam earns attention because it's the exception, not the default.
            </p>
          </div>
        </div>
      </Section>

      {/* GRADIENT TEXT + TYPEWRITER */}
      <Section label="06 · Text effects" title="Words that move.">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card !p-10">
            <p className="font-mono text-xs mb-4" style={{ color: 'rgb(var(--color-accent))' }}>
              GradientText
            </p>
            <h4 className="font-display text-5xl leading-tight">
              Build at the{' '}
              <GradientText>ceiling</GradientText>.
            </h4>
            <p className="text-sm mt-4 font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              An animated gradient cycles through two theme colors. Use on one or two emphasis words per
              section, never a whole paragraph.
            </p>
          </div>
          <div className="card !p-10">
            <p className="font-mono text-xs mb-4" style={{ color: 'rgb(var(--color-accent))' }}>
              TypewriterText
            </p>
            <h4 className="font-display text-3xl leading-tight">
              <TypewriterText text="The AI grades itself, then kills itself if it's wrong." speed={28} />
            </h4>
            <p className="text-sm mt-4 font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Typewriter fires when the element scrolls into view. Cursor blinks during typing.
            </p>
          </div>
        </div>
      </Section>

      {/* MAGNETIC BUTTON */}
      <Section label="07 · MagneticButton" title="Buttons that feel your hand.">
        <div className="card !p-12 flex flex-col items-center gap-6">
          <p className="font-light text-center max-w-xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Hover the buttons below. They subtly follow your cursor, then spring back when you leave.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <MagneticButton variant="primary">
              Start a project
              <ArrowRight size={16} />
            </MagneticButton>
            <MagneticButton variant="ghost">Read the spec</MagneticButton>
          </div>
        </div>
      </Section>
    </div>
  )
}
