import { motion } from 'motion/react'

type Testimonial = {
  quote: string
  author: string
  role?: string
  company?: string
  avatarUrl?: string
}

type Props = {
  eyebrow?: string
  title: string
  testimonials: Testimonial[]
}

/**
 * TestimonialGrid — masonry-style testimonial grid (2-col on md, 3-col on lg).
 * Cards have varying heights via CSS columns. Quotes lead, attribution follows.
 */
export function TestimonialGrid({ eyebrow, title, testimonials }: Props) {
  return (
    <section className="px-[8vw] py-24 border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
      <div className="max-w-7xl mx-auto">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-4xl md:text-6xl leading-tight mb-16 max-w-3xl">{title}</h2>
        <div className="md:columns-2 lg:columns-3 gap-6 [&>*]:mb-6 [&>*]:break-inside-avoid">
          {testimonials.map((t, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
              className="card !p-7 inline-block w-full"
            >
              <blockquote className="font-display text-xl leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: 'rgb(var(--color-accent) / 0.15)',
                      color: 'rgb(var(--color-accent))',
                    }}
                  >
                    {t.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm">{t.author}</div>
                  {(t.role || t.company) && (
                    <div className="text-xs font-light" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
                      {t.role}
                      {t.role && t.company ? ' · ' : ''}
                      {t.company}
                    </div>
                  )}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
