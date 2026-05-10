import { useEffect, useState, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search } from 'lucide-react'

export type PaletteCommand = {
  id: string
  label: string
  hint?: string
  group?: string
  icon?: React.ReactNode
  onRun: () => void
  /** Keywords boost match. */
  keywords?: string[]
}

type Props = {
  commands: PaletteCommand[]
  /** Keyboard shortcut. Default Cmd+K (mac) / Ctrl+K. */
  shortcut?: 'cmd-k' | 'ctrl-k'
  /** Open the palette programmatically. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * CommandPalette: Cmd+K / Ctrl+K command palette.
 * Glassy modal, fuzzy filter, keyboard nav (up/down + Enter), grouped by .group.
 *
 * The standard for SPAs / dashboards in 2026. Linear / Vercel / Raycast pattern.
 */
export function CommandPalette({ commands, shortcut = 'cmd-k', open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (v: boolean) => {
    setInternalOpen(v)
    onOpenChange?.(v)
  }

  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = shortcut === 'cmd-k' && (e.metaKey || e.ctrlKey) && e.key === 'k'
      const isCtrlK = shortcut === 'ctrl-k' && e.ctrlKey && e.key === 'k'
      if (isCmdK || isCtrlK) {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, shortcut])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands
      .map((c) => {
        const haystack = `${c.label} ${c.hint ?? ''} ${(c.keywords ?? []).join(' ')}`.toLowerCase()
        const score = haystack.includes(q) ? 1 : 0
        return { c, score }
      })
      .filter((x) => x.score > 0)
      .map((x) => x.c)
  }, [query, commands])

  const grouped = useMemo(() => {
    const groups: Record<string, PaletteCommand[]> = {}
    for (const c of filtered) {
      const g = c.group ?? 'General'
      if (!groups[g]) groups[g] = []
      groups[g].push(c)
    }
    return groups
  }, [filtered])

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const c = filtered[activeIdx]
      if (c) {
        c.onRun()
        setOpen(false)
      }
    }
  }

  let runningIdx = 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: 'rgb(0 0 0 / 0.55)', backdropFilter: 'blur(8px)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border overflow-hidden shadow-2xl"
            style={{
              background: 'rgb(var(--color-surface))',
              borderColor: 'rgb(var(--color-border) / 0.4)',
            }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
              <Search size={18} style={{ color: 'rgb(var(--color-fg-subtle))' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIdx(0)
                }}
                onKeyDown={onInputKey}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent outline-none text-base font-light placeholder:text-fg-subtle"
                style={{ color: 'rgb(var(--color-fg))' }}
              />
              <kbd
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded border"
                style={{
                  borderColor: 'rgb(var(--color-border) / 0.4)',
                  color: 'rgb(var(--color-fg-subtle))',
                }}
              >
                Esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center font-light text-sm" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
                  No matches.
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="px-2 py-2">
                    <div
                      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{ color: 'rgb(var(--color-fg-subtle))' }}
                    >
                      {group}
                    </div>
                    {items.map((c) => {
                      const idx = runningIdx++
                      const isActive = idx === activeIdx
                      return (
                        <button
                          key={c.id}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => {
                            c.onRun()
                            setOpen(false)
                          }}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm"
                          style={{
                            background: isActive ? 'rgb(var(--color-accent) / 0.12)' : 'transparent',
                            color: isActive ? 'rgb(var(--color-fg))' : 'rgb(var(--color-fg-muted))',
                          }}
                        >
                          {c.icon && <span style={{ color: 'rgb(var(--color-accent))' }}>{c.icon}</span>}
                          <span className="flex-1 font-medium">{c.label}</span>
                          {c.hint && (
                            <span className="text-xs font-mono" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
                              {c.hint}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            <div
              className="flex items-center justify-between px-5 py-2.5 border-t font-mono text-[10px] uppercase tracking-wider"
              style={{
                borderColor: 'rgb(var(--color-border) / 0.2)',
                color: 'rgb(var(--color-fg-subtle))',
              }}
            >
              <span>up/down navigate · enter run · esc close</span>
              <span>{filtered.length} commands</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
