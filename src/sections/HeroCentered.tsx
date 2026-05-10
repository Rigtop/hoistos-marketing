import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { AuroraOrbs } from '../components/AuroraOrbs'
import { GradientText } from '../components/GradientText'
import { MagneticButton } from '../components/MagneticButton'

type Props = {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
  primaryCta?: { label: string; onClick?: () => void }
  secondaryCta?: { label: string; onClick?: () => void }
}

/**
 * HeroCentered — centered title + tagline + dual CTA, aurora orbs background.
 * The default-safe hero. Use when copy is the star.
 */
export function HeroCentered({ eyebrow, title, subtitle, primaryCta, secondaryCta }: Props) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-[8vw] py-20 overflow-hidden text-center">
      <AuroraOrbs />
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative font-mono text-xs uppercase tracking-[0.3em] mb-8"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative font-display text-[clamp(56px,9vw,160px)] leading-[0.9] tracking-[-0.04em] mb-8 max-w-5xl"
      >
        {typeof title === 'string' ? <GradientText>{title}</GradientText> : title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative text-xl md:text-2xl font-light max-w-3xl leading-relaxed mb-10"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          {subtitle}
        </motion.p>
      )}
      {(primaryCta || secondaryCta) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative flex flex-wrap gap-3 justify-center"
        >
          {primaryCta && (
            <MagneticButton variant="primary" onClick={primaryCta.onClick}>
              {primaryCta.label}
              <ArrowRight size={16} />
            </MagneticButton>
          )}
          {secondaryCta && (
            <MagneticButton variant="ghost" onClick={secondaryCta.onClick}>
              {secondaryCta.label}
            </MagneticButton>
          )}
        </motion.div>
      )}
    </section>
  )
}
