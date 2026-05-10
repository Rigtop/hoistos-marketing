import { motion } from 'motion/react'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'

const ITEMS = [
  {
    icon: Sparkles,
    title: 'Aurora orbs',
    body: 'Three blurred radial gradients drifting on slow CSS animations. GPU-cheap depth without WebGL. Theme-aware via CSS vars.',
  },
  {
    icon: Zap,
    title: 'Motion + GSAP',
    body: 'Motion handles declarative React transitions and layout animations. GSAP runs outside the reconciler for scroll cinema that stays smooth under heavy state.',
  },
  {
    icon: ArrowRight,
    title: 'Dual brand presets',
    body: 'Tailwind themes for HoistOS (bold orange-on-obsidian) and Anthropic Claude Design (warm parchment + terracotta). Switch with one attribute.',
  },
]

export function ComponentShowcase() {
  return (
    <section className="px-[8vw] py-32 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <div className="max-w-7xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-[0.3em] mb-4" style={{ color: 'rgb(var(--color-accent))' }}>
          Sample components
        </p>
        <h2 className="font-display text-5xl md:text-7xl leading-tight tracking-tight mb-20 text-fg">
          Hover them. They <em className="not-italic" style={{ color: 'rgb(var(--color-accent))' }}>respond</em>.
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="card group cursor-pointer"
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 transition-colors"
                style={{ background: 'rgb(var(--color-accent) / 0.12)', color: 'rgb(var(--color-accent))' }}
              >
                <item.icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl mb-3 leading-tight text-fg">{item.title}</h3>
              <p className="text-base leading-relaxed font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
