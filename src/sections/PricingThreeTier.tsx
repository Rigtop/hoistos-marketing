import { motion } from 'motion/react'
import { Check, ArrowRight } from 'lucide-react'
import { BorderBeam } from '../components/BorderBeam'
import { MagneticButton } from '../components/MagneticButton'

type Tier = {
  name: string
  price: string
  cadence?: string
  description: string
  features: string[]
  cta: { label: string; onClick?: () => void }
  /** Highlight this tier with a BorderBeam. Default false. */
  featured?: boolean
}

type Props = {
  eyebrow?: string
  title: string
  tiers: [Tier, Tier, Tier] | Tier[]
}

/**
 * PricingThreeTier — three-column pricing block. Middle tier optionally featured with BorderBeam.
 */
export function PricingThreeTier({ eyebrow, title, tiers }: Props) {
  return (
    <section className="px-[8vw] py-24 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <div className="max-w-7xl mx-auto">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3 text-center" style={{ color: 'rgb(var(--color-accent))' }}>
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl md:text-6xl leading-tight mb-16 text-center">{title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`card relative !p-8 flex flex-col ${tier.featured ? '!border-2' : ''}`}
              style={tier.featured ? { borderColor: 'rgb(var(--color-accent) / 0.3)' } : undefined}
            >
              {tier.featured && <BorderBeam size={28} duration={6} />}
              <div className="mb-6">
                <h3 className="font-display text-2xl mb-2">{tier.name}</h3>
                <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  {tier.description}
                </p>
              </div>
              <div className="mb-8">
                <span className="font-brand font-bold text-5xl tracking-tighter">{tier.price}</span>
                {tier.cadence && (
                  <span className="ml-2 text-sm font-light" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
                    {tier.cadence}
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm font-light">
                    <Check size={16} className="mt-1 flex-shrink-0" style={{ color: 'rgb(var(--color-accent))' }} />
                    <span style={{ color: 'rgb(var(--color-fg-muted))' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <MagneticButton variant={tier.featured ? 'primary' : 'ghost'} onClick={tier.cta.onClick} className="w-full">
                {tier.cta.label}
                <ArrowRight size={16} />
              </MagneticButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
