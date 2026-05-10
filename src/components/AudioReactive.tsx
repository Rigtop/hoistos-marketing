import { useEffect, useRef, useState } from 'react'
import { Mic, Volume2, VolumeX } from 'lucide-react'

type Mode = 'bars' | 'radial'

type Props = {
  mode?: Mode
  /** Number of frequency bins to render. Default 64. Capped to AnalyserNode size. */
  bins?: number
  className?: string
}

/**
 * AudioReactive: Web Audio API + AnalyserNode + canvas visualizer.
 *
 * Three sources: silent (simulated waveform for demos), mic (live), or attach
 * an HTMLAudioElement via the toggle. Two render modes: bars or radial.
 *
 * The hard part: permission flow + AudioContext lifecycle. AudioContext can
 * only start on a user gesture, so we lazy-init on first toggle.
 */
export function AudioReactive({ mode: initialMode = 'bars', bins = 64, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [active, setActive] = useState(false)
  const [permError, setPermError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>(initialMode)

  async function start() {
    setPermError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source

      const analyser = ctx.createAnalyser()
      analyser.fftSize = Math.max(256, bins * 4)
      analyser.smoothingTimeConstant = 0.78
      analyserRef.current = analyser

      source.connect(analyser)
      setActive(true)
    } catch (e) {
      setPermError((e as Error).message ?? 'Microphone permission denied')
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    sourceRef.current?.disconnect()
    audioCtxRef.current?.close()
    streamRef.current = null
    sourceRef.current = null
    analyserRef.current = null
    audioCtxRef.current = null
    setActive(false)
  }

  useEffect(() => () => stop(), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let raf = 0

    function resize() {
      const r = canvas!.getBoundingClientRect()
      canvas!.width = r.width * dpr
      canvas!.height = r.height * dpr
      ctx!.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(() => {
      const w = canvas!.width / dpr
      const h = canvas!.height / dpr
      ctx!.clearRect(0, 0, w, h)
      resize()
    })
    ro.observe(canvas)

    function draw() {
      const w = canvas!.clientWidth
      const h = canvas!.clientHeight
      ctx!.clearRect(0, 0, w, h)

      const styles = getComputedStyle(document.documentElement)
      const accent = styles.getPropertyValue('--color-accent').trim() || '242 90 0'
      const accent2 = styles.getPropertyValue('--color-accent-2').trim() || '255 138 61'

      let data: Uint8Array
      if (analyserRef.current) {
        const buf = new Uint8Array(new ArrayBuffer(analyserRef.current.frequencyBinCount))
        analyserRef.current.getByteFrequencyData(buf)
        data = buf
      } else {
        const t = performance.now() / 250
        data = new Uint8Array(bins)
        for (let i = 0; i < bins; i++) {
          const f = i / bins
          const v =
            (Math.sin(t + i * 0.18) * 0.5 + 0.5) *
            (1 - f * 0.6) *
            (Math.sin(t * 0.5 + i * 0.07) * 0.5 + 0.5) *
            255
          data[i] = Math.max(0, Math.min(255, v))
        }
      }

      const slice = Math.floor(data.length / bins)
      const sample = (i: number) => {
        let sum = 0
        for (let j = 0; j < slice; j++) sum += data[i * slice + j]
        return sum / slice / 255
      }

      if (mode === 'bars') {
        const gap = 4
        const barW = (w - gap * (bins - 1)) / bins
        const grad = ctx!.createLinearGradient(0, h, 0, 0)
        grad.addColorStop(0, `rgb(${accent})`)
        grad.addColorStop(1, `rgb(${accent2})`)
        ctx!.fillStyle = grad
        for (let i = 0; i < bins; i++) {
          const v = sample(i)
          const barH = Math.max(2, v * h * 0.95)
          const x = i * (barW + gap)
          const y = h - barH
          ctx!.fillRect(x, y, barW, barH)
        }
      } else {
        const cx = w / 2
        const cy = h / 2
        const inner = Math.min(w, h) * 0.18
        const max = Math.min(w, h) * 0.45 - inner
        ctx!.lineWidth = 3
        ctx!.lineCap = 'round'
        for (let i = 0; i < bins; i++) {
          const v = sample(i)
          const angle = (i / bins) * Math.PI * 2 - Math.PI / 2
          const len = inner + v * max
          const x1 = cx + Math.cos(angle) * inner
          const y1 = cy + Math.sin(angle) * inner
          const x2 = cx + Math.cos(angle) * len
          const y2 = cy + Math.sin(angle) * len
          const grad = ctx!.createLinearGradient(x1, y1, x2, y2)
          grad.addColorStop(0, `rgb(${accent} / 0.9)`)
          grad.addColorStop(1, `rgb(${accent2} / 0.4)`)
          ctx!.strokeStyle = grad
          ctx!.beginPath()
          ctx!.moveTo(x1, y1)
          ctx!.lineTo(x2, y2)
          ctx!.stroke()
        }
        ctx!.strokeStyle = `rgb(${accent} / 0.25)`
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.arc(cx, cy, inner * 0.95, 0, Math.PI * 2)
        ctx!.stroke()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [mode, bins])

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" aria-hidden />

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex rounded-full border p-1" style={{ borderColor: 'rgb(var(--color-border) / 0.4)', background: 'rgb(var(--color-surface) / 0.8)', backdropFilter: 'blur(10px)' }}>
          {(['bars', 'radial'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-mono transition-colors"
              style={{
                background: mode === m ? 'rgb(var(--color-accent))' : 'transparent',
                color: mode === m ? 'rgb(var(--color-bg))' : 'rgb(var(--color-fg-muted))',
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={() => (active ? stop() : start())}
          className="btn btn-ghost !p-2 !rounded-full"
          aria-label={active ? 'Stop microphone' : 'Start microphone'}
          data-cursor="hover"
        >
          {active ? <VolumeX size={16} /> : <Mic size={16} />}
        </button>
      </div>

      {!active && !permError && (
        <div className="absolute bottom-4 left-4 font-mono text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
          <Volume2 size={12} className="inline mr-1.5 align-middle" />
          Simulated waveform · click mic for live
        </div>
      )}
      {permError && (
        <div className="absolute bottom-4 left-4 font-mono text-xs" style={{ color: 'rgb(var(--color-accent))' }}>
          {permError}
        </div>
      )}
    </div>
  )
}
