import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Zap, Layers, ArrowRight, Database } from 'lucide-react'

import { AudioReactive } from './AudioReactive'
import { CommandPalette, type PaletteCommand } from './CommandPalette'
import { VariableScrollText } from './VariableScrollText'
import { ScrollTube3D } from './webgl/ScrollTube3D'
import { OGPreview } from './OGPreview'

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="border-t py-20"
      style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}
    >
      <div className="max-w-7xl mx-auto px-[8vw]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
          {label}
        </p>
        <h3 className="font-display text-4xl md:text-5xl mb-12 leading-tight">{title}</h3>
        {children}
      </div>
    </motion.section>
  )
}

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&auto=format&fit=crop',
]

export function InfraShowcase() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  const commands: PaletteCommand[] = [
    {
      id: 'theme-hoistos',
      label: 'Switch to HoistOS theme',
      hint: 'theme',
      group: 'Theme',
      icon: <Sparkles size={16} strokeWidth={1.5} />,
      onRun: () => document.documentElement.setAttribute('data-theme', 'hoistos'),
    },
    {
      id: 'theme-claude',
      label: 'Switch to Claude Design theme',
      hint: 'theme',
      group: 'Theme',
      icon: <Sparkles size={16} strokeWidth={1.5} />,
      onRun: () => document.documentElement.setAttribute('data-theme', 'claude'),
    },
    {
      id: 'cursor-on',
      label: 'Activate custom cursor',
      hint: 'cursor',
      group: 'Cursor',
      icon: <Zap size={16} strokeWidth={1.5} />,
      onRun: () => document.documentElement.setAttribute('data-custom-cursor', 'on'),
    },
    {
      id: 'cursor-off',
      label: 'Restore browser cursor',
      hint: 'cursor',
      group: 'Cursor',
      icon: <Zap size={16} strokeWidth={1.5} />,
      onRun: () => document.documentElement.removeAttribute('data-custom-cursor'),
    },
    {
      id: 'scroll-top',
      label: 'Scroll to top',
      hint: 'up',
      group: 'Navigation',
      icon: <ArrowRight size={16} strokeWidth={1.5} />,
      onRun: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      id: 'scroll-shader',
      label: 'Jump to ShaderShowcase',
      hint: 'section 14',
      group: 'Navigation',
      icon: <Layers size={16} strokeWidth={1.5} />,
      onRun: () => document.querySelectorAll('section')[12]?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'log-stack',
      label: 'Log component inventory to console',
      hint: 'debug',
      group: 'Debug',
      icon: <Database size={16} strokeWidth={1.5} />,
      onRun: () => console.log('visual-stack v1.3 · 33 components + 10 sections + 1 skill'),
    },
  ]

  return (
    <div>
      <CommandPalette commands={commands} open={paletteOpen} onOpenChange={setPaletteOpen} />

      <Section label="18 · CommandPalette · Cmd+K" title="Linear-grade command palette.">
        <div className="card !p-12 text-center">
          <p className="text-base font-light mb-6 max-w-xl mx-auto" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Press{' '}
            <kbd
              className="font-mono text-xs px-2 py-1 rounded border mx-1"
              style={{
                borderColor: 'rgb(var(--color-border) / 0.4)',
                background: 'rgb(var(--color-surface-2))',
              }}
            >
              Cmd K
            </kbd>{' '}
            anywhere on this page. Or click below.
          </p>
          <button onClick={() => setPaletteOpen(true)} className="btn btn-primary" data-cursor="hover">
            Open command palette
            <ArrowRight size={16} />
          </button>
          <p className="text-xs font-mono mt-6" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
            Try: switch theme · activate custom cursor · jump to section · debug log
          </p>
        </div>
      </Section>

      <Section label="19 · AudioReactive · Web Audio API" title="Sound. Painted on canvas.">
        <div className="card !p-2">
          <div className="relative" style={{ height: '320px' }}>
            <AudioReactive mode="bars" />
          </div>
        </div>
        <p className="text-sm font-light mt-6 max-w-2xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Web Audio API plus AnalyserNode plus canvas. Bars + radial modes (toggle top-right). Click
          the mic icon to grant microphone access for live audio. Without it, simulated waveform plays
          for demos. Permission flow handled cleanly; AudioContext only starts on user gesture.
        </p>
      </Section>

      <Section label="20 · OG generator · Branded social cards" title="Every link looks pro.">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <OGPreview
            title="Build at the ceiling."
            subtitle="visual-stack: React + Motion + GSAP + R3F + Lenis + ogl + GLSL shaders."
            brand="visual-stack"
          />
          <div>
            <p className="text-base leading-relaxed font-light mb-4" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Canvas-based 1200x630 PNG generator. Reads the active CSS theme (HoistOS or Claude) and
              renders title + subtitle + brand mark with the right palette. Try switching themes via
              the top-right toggle. The OG image regenerates live.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              Use case: every investor link shared on Slack / iMessage / LinkedIn / Twitter shows a
              branded preview instead of a generic favicon.
            </p>
          </div>
        </div>
      </Section>

      <Section label="21 · VariableScrollText · Type accordion" title="Scroll the page. Watch the weight.">
        <div className="card !p-16 text-center">
          <p
            className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight"
            style={{ color: 'rgb(var(--color-fg))' }}
          >
            Letters that{' '}
            <VariableScrollText
              axis="wght"
              range={[200, 900]}
              fontFamily='Inter, "Inter Variable", sans-serif'
              className="inline-block"
            >
              breathe
            </VariableScrollText>
            .
          </p>
          <p className="text-sm font-light mt-8 max-w-xl mx-auto" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Font weight tied to scroll position via{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgb(var(--color-surface-2))' }}>
              font-variation-settings
            </code>
            . Inter Variable. Range 200 to 900. Awwwards-tier typographic narrative effect.
          </p>
        </div>
      </Section>

      <section className="relative border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)', height: '200vh' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-end pb-20 overflow-hidden">
          <ScrollTube3D images={SAMPLE_IMAGES} radius={3.5} />
          <div className="relative z-10 max-w-2xl text-center px-[8vw]">
            <p
              className="font-mono text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              22 · ScrollTube3D · R3F · Codrops 2026
            </p>
            <h3 className="font-display text-4xl md:text-5xl leading-tight mb-3">
              Scroll. The tube turns.
            </h3>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              An infinite cylinder of image planes orbiting a vertical axis. Scroll position drives
              rotation + descent. The Codrops Reactive Depth pattern that's been all over Awwwards in 2026.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
