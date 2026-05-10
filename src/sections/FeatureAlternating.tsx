import { motion } from 'motion/react'

type Row = {
  eyebrow?: string
  title: string
  description: string
  visual: React.ReactNode
}

type Props = {
  rows: Row[]
}

/**
 * FeatureAlternating — text-image rows that flip side per row.
 * Use when each feature deserves real visual real estate (product shots, charts).
 */
export function FeatureAlternating({ rows }: Props) {
  return (
    <section className="px-[8vw] py-24 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <div className="max-w-7xl mx-auto space-y-32">
        {rows.map((row, i) => {
          const reverse = i % 2 === 1
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className={reverse ? 'md:order-2' : ''}>
                {row.eyebrow && (
                  <p
                    className="font-mono text-xs uppercase tracking-[0.3em] mb-4"
                    style={{ color: 'rgb(var(--color-accent))' }}
                  >
                    {row.eyebrow}
                  </p>
                )}
                <h3 className="font-display text-3xl md:text-5xl leading-tight mb-5">{row.title}</h3>
                <p className="text-base md:text-lg font-light leading-relaxed max-w-xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  {row.description}
                </p>
              </div>
              <div className={`relative ${reverse ? 'md:order-1' : ''}`}>{row.visual}</div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
