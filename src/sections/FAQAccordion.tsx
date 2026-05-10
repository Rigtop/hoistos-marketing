import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'

type Item = { question: string; answer: React.ReactNode }

type Props = {
  eyebrow?: string
  title: string
  items: Item[]
  /** Allow multiple items open simultaneously. Default false. */
  allowMultiple?: boolean
}

/**
 * FAQAccordion — accessible accordion with smooth height animation.
 * Plus icon rotates 45° to X on open. Smooth height + opacity transitions.
 */
export function FAQAccordion({ eyebrow, title, items, allowMultiple = false }: Props) {
  const [open, setOpen] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else {
        if (!allowMultiple) next.clear()
        next.add(i)
      }
      return next
    })
  }

  return (
    <section className="px-[8vw] py-24 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <div className="max-w-3xl mx-auto">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3 text-center" style={{ color: 'rgb(var(--color-accent))' }}>
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl md:text-5xl leading-tight mb-12 text-center">{title}</h2>
        <ul className="border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
          {items.map((item, i) => {
            const isOpen = open.has(i)
            return (
              <li key={i} className="border-b" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left py-6 flex items-center justify-between gap-4 group"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg md:text-xl leading-tight">{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="flex-shrink-0"
                    style={{ color: 'rgb(var(--color-accent))' }}
                  >
                    <Plus size={22} strokeWidth={1.5} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="pb-6 text-base font-light leading-relaxed max-w-2xl"
                        style={{ color: 'rgb(var(--color-fg-muted))' }}
                      >
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
