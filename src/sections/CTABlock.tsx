import { ArrowRight } from 'lucide-react'
import { Spotlight } from '../components/Spotlight'
import { MagneticButton } from '../components/MagneticButton'
import { GradientText } from '../components/GradientText'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  primaryCta: { label: string; onClick?: () => void }
  secondaryCta?: { label: string; onClick?: () => void }
}

/**
 * CTABlock — closing call-to-action with Spotlight cursor effect.
 * Use as the last section before footer, or mid-page when conversion is the goal.
 */
export function CTABlock({ eyebrow, title, subtitle, primaryCta, secondaryCta }: Props) {
  return (
    <section className="px-[8vw] py-24 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <Spotlight className="card !p-16 text-center max-w-5xl mx-auto" size={500}>
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'rgb(var(--color-accent))' }}>
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl md:text-7xl leading-tight tracking-tight mb-6">
          <GradientText>{title}</GradientText>
        </h2>
        {subtitle && (
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <MagneticButton variant="primary" onClick={primaryCta.onClick}>
            {primaryCta.label}
            <ArrowRight size={16} />
          </MagneticButton>
          {secondaryCta && (
            <MagneticButton variant="ghost" onClick={secondaryCta.onClick}>
              {secondaryCta.label}
            </MagneticButton>
          )}
        </div>
      </Spotlight>
    </section>
  )
}
