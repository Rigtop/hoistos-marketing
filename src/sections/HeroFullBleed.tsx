import { motion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { GradientMesh } from '../components/GradientMesh'
import { NoiseTexture } from '../components/NoiseTexture'

type Props = {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
}

/**
 * HeroFullBleed — full-screen GradientMesh + NoiseTexture under center text.
 * Maximum visual impact, minimum copy. Use for "manifesto" openings.
 */
export function HeroFullBleed({ eyebrow, title, subtitle }: Props) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-[8vw] py-20 overflow-hidden text-center">
      <GradientMesh />
      <NoiseTexture opacity={0.08} />
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative font-mono text-xs uppercase tracking-[0.4em] mb-8"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative font-display text-[clamp(64px,12vw,200px)] leading-[0.88] tracking-[-0.045em] max-w-6xl"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative text-lg md:text-xl font-light max-w-2xl leading-relaxed mt-10"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative mt-16"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        <ArrowDown size={20} />
      </motion.div>
    </section>
  )
}
