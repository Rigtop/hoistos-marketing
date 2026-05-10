import { motion } from 'motion/react'
import { AuroraOrbs } from './AuroraOrbs'
import { FloatingGeometry } from './FloatingGeometry'
import { GradientText } from './GradientText'
import { TypewriterText } from './TypewriterText'
import { MagneticButton } from './MagneticButton'
import { ArrowRight } from 'lucide-react'

export function AnimatedHero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-[8vw] py-20 overflow-hidden">
      <AuroraOrbs />
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <FloatingGeometry />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative font-mono text-xs uppercase tracking-[0.25em] mb-8 flex items-center gap-3"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        <span className="block w-8 h-px" style={{ background: 'rgb(var(--color-accent))' }} />
        Visual Stack v1.0 · React + Motion + GSAP + R3F
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative font-display text-[clamp(72px,13vw,220px)] leading-[0.88] tracking-[-0.045em] mb-8"
      >
        Build at the{' '}
        <GradientText>ceiling</GradientText>.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative text-xl md:text-2xl font-light max-w-3xl leading-relaxed mb-6 min-h-[5rem]"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        <TypewriterText
          text="React, Tailwind, shadcn, Motion, GSAP, Three.js. Two brand presets. One scaffolding skill. Studio-grade visual deliverables on demand."
          speed={22}
          delay={500}
        />
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative flex flex-wrap gap-3 mt-8"
      >
        <MagneticButton variant="primary">
          Start scaffolding
          <ArrowRight size={16} />
        </MagneticButton>
        <MagneticButton variant="ghost">Read the spec</MagneticButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-10 left-[8vw] font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-3"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Scroll · the rest is below
        <motion.span
          animate={{ scaleY: [0.7, 1, 0.7], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="block h-10 w-px origin-top"
          style={{ background: 'linear-gradient(to bottom, rgb(var(--color-accent)), transparent)' }}
        />
      </motion.div>
    </section>
  )
}
