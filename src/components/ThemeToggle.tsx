import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

type Theme = 'hoistos' | 'claude'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('hoistos')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-1 rounded-full border border-fg-subtle/20 bg-surface/80 p-1 backdrop-blur-md">
      {(['hoistos', 'claude'] as Theme[]).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className="relative px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors"
          style={{ color: theme === t ? 'rgb(var(--color-bg))' : 'rgb(var(--color-fg-muted))' }}
        >
          {theme === t && (
            <motion.div
              layoutId="theme-pill"
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgb(var(--color-accent))' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative">{t === 'hoistos' ? 'HoistOS' : 'Claude'}</span>
        </button>
      ))}
    </div>
  )
}
