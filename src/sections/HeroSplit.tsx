import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { MagneticButton } from '../components/MagneticButton'
import { BlurText } from '../components/BlurText'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  visual: React.ReactNode
  primaryCta?: { label: string; onClick?: () => void }
  reverse?: boolean
}

/**
 * HeroSplit — copy on one side, visual on the other.
 * Use when you have a real product shot or featured visual that earns half the screen.
 */
export function HeroSplit({ eyebrow, title, subtitle, visual, primaryCta, reverse }: Props) {
  return (
    <section className="relative min-h-screen px-[8vw] py-20 grid md:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className={reverse ? 'md:order-2' : ''}
      >
        {eyebrow && (
          <p
            className="font-mono text-xs uppercase tracking-[0.3em] mb-6"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[clamp(48px,7vw,108px)] leading-[0.95] tracking-tight mb-6">
          <BlurText text={title} stagger={0.03} blur={8} />
        </h1>
        {subtitle && (
          <p
            className="text-lg md:text-xl font-light leading-relaxed mb-8 max-w-xl"
            style={{ color: 'rgb(var(--color-fg-muted))' }}
          >
            {subtitle}
          </p>
        )}
        {primaryCta && (
          <MagneticButton variant="primary" onClick={primaryCta.onClick}>
            {primaryCta.label}
            <ArrowRight size={16} />
          </MagneticButton>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`relative ${reverse ? 'md:order-1' : ''}`}
      >
        {visual}
      </motion.div>
    </section>
  )
}
