import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Page = {
  id: string | number
  front: React.ReactNode
  back?: React.ReactNode
}

type Props = {
  pages: Page[]
  className?: string
  /** Page width in px or CSS unit. Default 380. */
  pageWidth?: number | string
  /** Page height in px or CSS unit. Default 520. */
  pageHeight?: number | string
}

/**
 * Flipbook — vanilla CSS 3D page-turn.
 *
 * Each page rotates around its left edge with backface-visibility hidden.
 * Click a page (or use arrows) to advance. Pre-flipped pages stack right,
 * flipped ones stack left. CSS perspective on the container provides depth.
 *
 * Use case: pitch deck rendered as a real flippable book; product
 * brochure; story-shaped narrative deliverable.
 */
export function Flipbook({ pages, className = '', pageWidth = 380, pageHeight = 520 }: Props) {
  const [flipped, setFlipped] = useState(0)
  const total = pages.length

  const next = useCallback(() => setFlipped((f) => Math.min(f + 1, total)), [total])
  const prev = useCallback(() => setFlipped((f) => Math.max(f - 1, 0)), [])

  const w = typeof pageWidth === 'number' ? `${pageWidth}px` : pageWidth
  const h = typeof pageHeight === 'number' ? `${pageHeight}px` : pageHeight

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div
        className="relative"
        style={{
          width: w,
          height: h,
          perspective: '1800px',
        }}
      >
        {pages.map((page, i) => {
          const isFlipped = i < flipped
          return (
            <div
              key={page.id}
              onClick={() => (isFlipped ? prev() : next())}
              role="button"
              tabIndex={0}
              className="absolute top-0 left-0 w-full h-full cursor-pointer select-none"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
                transform: `rotateY(${isFlipped ? -180 : 0}deg)`,
                transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isFlipped ? i : total - i,
              }}
            >
              {/* Front face */}
              <div
                className="absolute inset-0 card !p-8 flex flex-col"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span
                  className="font-mono text-xs uppercase tracking-[0.3em] mb-3"
                  style={{ color: 'rgb(var(--color-accent))' }}
                >
                  Page {i + 1} / {total}
                </span>
                <div className="flex-1">{page.front}</div>
              </div>
              {/* Back face */}
              <div
                className="absolute inset-0 card !p-8 flex flex-col"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {page.back ?? (
                  <div className="flex-1 flex items-center justify-center opacity-40">
                    <span className="font-mono text-xs">— back of page {i + 1} —</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={prev}
          disabled={flipped === 0}
          className="btn btn-ghost !rounded-full !p-3 disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </motion.button>
        <span
          className="font-mono text-xs uppercase tracking-wider min-w-[80px] text-center"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          {flipped} / {total}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={next}
          disabled={flipped === total}
          className="btn btn-primary !rounded-full !p-3 disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  )
}
