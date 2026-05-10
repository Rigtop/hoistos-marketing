import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Download } from 'lucide-react'
import { generateOgImage, downloadOgImage } from '../og/generate-og'

type Props = {
  title: string
  subtitle?: string
  brand?: string
}

/**
 * OGPreview: shows the generated 1200x630 OG image inline + a download button.
 * Regenerates whenever theme changes.
 */
export function OGPreview({ title, subtitle, brand = 'visual-stack' }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    generateOgImage({ title, subtitle, brand }).then((u) => {
      if (!cancelled) setUrl(u)
    })

    const obs = new MutationObserver(() => {
      generateOgImage({ title, subtitle, brand }).then((u) => {
        if (!cancelled) setUrl(u)
      })
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      cancelled = true
      obs.disconnect()
    }
  }, [title, subtitle, brand])

  return (
    <div className="space-y-4">
      <div
        className="relative rounded-2xl overflow-hidden border"
        style={{
          aspectRatio: '1200 / 630',
          borderColor: 'rgb(var(--color-border) / 0.3)',
        }}
      >
        {url && (
          <motion.img
            key={url}
            src={url}
            alt="OG image preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <button
        onClick={() => downloadOgImage({ title, subtitle, brand })}
        className="btn btn-primary"
        data-cursor="hover"
      >
        Download og.png
        <Download size={16} />
      </button>
    </div>
  )
}
