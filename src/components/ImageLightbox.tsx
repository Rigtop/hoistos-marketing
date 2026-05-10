import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

type Props = {
  src: string
  alt?: string
  thumbnailClassName?: string
  /** Caption shown when expanded. */
  caption?: string
}

/**
 * ImageLightbox: Apple-style click-to-expand image.
 * Click the thumbnail; the full image animates into a centered, padded modal
 * with caption and Esc to close.
 *
 * Uses Motion's layoutId for shared-element morph between thumbnail and full view.
 */
export function ImageLightbox({ src, alt = '', thumbnailClassName = '', caption }: Props) {
  const [open, setOpen] = useState(false)
  const id = `lightbox-${Math.random().toString(36).slice(2, 9)}`

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <motion.div
        layoutId={id}
        onClick={() => setOpen(true)}
        className={`cursor-zoom-in overflow-hidden rounded-2xl ${thumbnailClassName}`}
        whileHover={{ scale: 1.01 }}
        data-cursor="hover"
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-6 md:p-12"
            style={{ background: 'rgb(0 0 0 / 0.85)', backdropFilter: 'blur(16px)' }}
            onClick={() => setOpen(false)}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 btn btn-ghost !p-3 !rounded-full"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <motion.figure
              layoutId={id}
              className="max-w-6xl max-h-full flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className="rounded-2xl object-contain max-h-[85vh] cursor-zoom-out"
                onClick={() => setOpen(false)}
              />
              {caption && (
                <figcaption
                  className="font-mono text-xs uppercase tracking-wider text-center"
                  style={{ color: 'rgb(var(--color-fg-subtle))' }}
                >
                  {caption}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
