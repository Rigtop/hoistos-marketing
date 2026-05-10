import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'

type Toast = {
  id: number
  kind: ToastKind
  title: string
  description?: string
  /** Auto-dismiss in ms. Default 4000. Pass 0 to disable. */
  duration?: number
}

type Ctx = {
  show: (t: Omit<Toast, 'id'>) => void
}

const ToastCtx = createContext<Ctx | null>(null)

/**
 * useToast: hook to fire toasts from any component under <ToastProvider />.
 *
 *   const { show } = useToast()
 *   show({ kind: 'success', title: 'Saved', description: 'All good.' })
 */
export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider />')
  return ctx
}

const ICON: Record<ToastKind, React.ComponentType<{ size: number; strokeWidth: number }>> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const ACCENT: Record<ToastKind, string> = {
  success: 'rgb(110 220 140)',
  error: 'rgb(220 80 80)',
  info: 'rgb(var(--color-accent))',
}

/**
 * ToastProvider: drop at the root of your app to enable useToast().
 * Renders the toast viewport bottom-right with stacked animated toasts.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useState({ current: 0 })[0] as { current: number }

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const show = useCallback<Ctx['show']>(
    (t) => {
      idRef.current = (idRef.current ?? 0) + 1
      const id = idRef.current
      const toast: Toast = { ...t, id, duration: t.duration ?? 4000 }
      setToasts((ts) => [...ts, toast])
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => dismiss(id), toast.duration)
      }
    },
    [dismiss, idRef]
  )

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = ICON[toast.kind]
  const accent = ACCENT[toast.kind]
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return
    const start = performance.now()
    let raf = 0
    function tick() {
      const elapsed = performance.now() - start
      setProgress(Math.max(0, 1 - elapsed / toast.duration!))
      if (elapsed < toast.duration!) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [toast.duration])

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="pointer-events-auto card relative !p-4 min-w-[320px] max-w-md flex items-start gap-3 overflow-hidden"
      style={{ background: 'rgb(var(--color-surface))' }}
    >
      <div
        className="flex-shrink-0 mt-0.5"
        style={{ color: accent }}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-tight">{toast.title}</div>
        {toast.description && (
          <div className="text-xs font-light mt-1 leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {toast.description}
          </div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            width: `${progress * 100}%`,
            background: accent,
            transition: 'width 0.05s linear',
          }}
        />
      )}
    </motion.div>
  )
}
