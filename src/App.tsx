import { LenisProvider } from './components/LenisProvider'
import { CustomCursor } from './components/CustomCursor'
import { ThemeToggle } from './components/ThemeToggle'
import { AnimatedHero } from './components/AnimatedHero'
import { StatGrid } from './components/StatGrid'
import { ScrollSection } from './components/ScrollSection'
import { ComponentShowcase } from './components/ComponentShowcase'
import { LibraryShowcase } from './components/LibraryShowcase'
import { EliteShowcase } from './components/EliteShowcase'
import { ShaderShowcase } from './components/ShaderShowcase'
import { InfraShowcase } from './components/InfraShowcase'
import { PolishShowcase } from './components/PolishShowcase'

function App() {
  return (
    <LenisProvider>
      <CustomCursor />
      <div className="min-h-screen">
        <ThemeToggle />
        <AnimatedHero />
        <StatGrid />
        <ScrollSection />
        <ComponentShowcase />
        <LibraryShowcase />
        <EliteShowcase />
        <ShaderShowcase />
        <InfraShowcase />
        <PolishShowcase />
        <footer
          className="px-[8vw] py-16 border-t flex justify-between items-end flex-wrap gap-6"
          style={{
            borderColor: 'rgb(var(--color-border) / 0.2)',
            background: 'rgb(var(--color-surface))',
          }}
        >
          <div className="font-display text-3xl">
            The{' '}
            <em className="not-italic" style={{ color: 'rgb(var(--color-accent))' }}>
              visual-stack
            </em>{' '}
            · v1.4 · 40 components, 10 sections, GLSL + audio + cmd-K + confetti.
          </div>
          <div
            className="font-mono text-xs leading-loose tracking-wider text-right"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            Eugeen Bernan · 2026-05-01
            <br />
            Subsystems/visual-stack/ v1.4
            <br />
            React + Vite + Tailwind + Motion + GSAP + R3F + ogl + Lenis
          </div>
        </footer>
      </div>
    </LenisProvider>
  )
}

export default App
