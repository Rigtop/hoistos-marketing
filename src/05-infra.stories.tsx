import { useState } from 'react'
import type { Story } from '@ladle/react'
import { ArrowRight, Sparkles, Zap, Layers } from 'lucide-react'
import { CommandPalette, type PaletteCommand } from './components/CommandPalette'
import { AudioReactive } from './components/AudioReactive'
import { VariableScrollText } from './components/VariableScrollText'
import { OGPreview } from './components/OGPreview'
import { useToast } from './components/Toast'

export default {
  title: '05 · Infra',
}

function CommandPaletteInner() {
  const [open, setOpen] = useState(false)
  const commands: PaletteCommand[] = [
    {
      id: 'theme-h',
      label: 'Switch to HoistOS theme',
      hint: 'theme',
      group: 'Theme',
      icon: <Sparkles size={16} strokeWidth={1.5} />,
      onRun: () => document.documentElement.setAttribute('data-theme', 'hoistos'),
    },
    {
      id: 'theme-c',
      label: 'Switch to Claude theme',
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
      id: 'log',
      label: 'Log to console',
      hint: 'debug',
      group: 'Debug',
      icon: <Layers size={16} strokeWidth={1.5} />,
      onRun: () => console.log('command palette ladle demo'),
    },
  ]
  return (
    <div>
      <CommandPalette commands={commands} open={open} onOpenChange={setOpen} />
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        Open palette (or press Cmd K)
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

export const CommandPaletteStory: Story = () => <CommandPaletteInner />

export const AudioReactiveStory: Story = () => (
  <div className="card !p-2 max-w-3xl">
    <div className="relative" style={{ height: '320px' }}>
      <AudioReactive mode="bars" />
    </div>
  </div>
)

export const VariableScrollTextStory: Story = () => (
  <div style={{ height: '180vh' }} className="flex items-center justify-center">
    <p className="font-display text-7xl text-center">
      Letters that{' '}
      <VariableScrollText axis="wght" range={[200, 900]}>
        breathe
      </VariableScrollText>
      .
    </p>
  </div>
)

export const OGPreviewStory: Story = () => (
  <div className="max-w-2xl">
    <OGPreview
      title="Build at the ceiling."
      subtitle="visual-stack: React + Motion + GSAP + R3F + ogl + Lenis."
      brand="visual-stack"
    />
  </div>
)

function ToastInner() {
  const { show } = useToast()
  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="btn btn-primary"
        onClick={() => show({ kind: 'success', title: 'Saved', description: 'All good.' })}
      >
        Success
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => show({ kind: 'error', title: 'Broke', description: 'Try again.' })}
      >
        Error
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => show({ kind: 'info', title: 'FYI', description: 'A thing.' })}
      >
        Info
      </button>
    </div>
  )
}

export const ToastStory: Story = () => <ToastInner />
