import { motion } from 'motion/react'

type Feature = {
  icon: React.ReactNode
  title: string
  description: string
}

type Props = {
  eyebrow?: string
  title: string
  features: [Feature, Feature, Feature] | Feature[]
}

/**
 * FeatureGrid3Up — three-column feature row.
 * The classic "what you get" grid. Use after a hero, before a CTA.
 */
export function FeatureGrid3Up({ eyebrow, title, features }: Props) {
  return (
    <section className="px-[8vw] py-24 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <div className="max-w-7xl mx-auto">
        {eyebrow && (
          <p
            className="font-mono text-xs uppercase tracking-[0.3em] mb-3"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl md:text-6xl leading-tight mb-16 max-w-3xl">{title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="card !p-8"
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                style={{ background: 'rgb(var(--color-accent) / 0.12)', color: 'rgb(var(--color-accent))' }}
              >
                {f.icon}
              </div>
              <h3 className="font-display text-2xl mb-3 leading-tight">{f.title}</h3>
              <p className="text-base leading-relaxed font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
