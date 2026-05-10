import { useEffect } from 'react'
import type { Story } from '@ladle/react'
import { Sparkles, Zap, Layers, Cpu } from 'lucide-react'
import { AuroraOrbs } from './components/AuroraOrbs'
import { ParticleField } from './components/ParticleField'
import { BlurText } from './components/BlurText'
import { MarqueeLogos } from './components/MarqueeLogos'
import { GlitchText } from './components/GlitchText'
import { GradientMesh } from './components/GradientMesh'
import { NoiseTexture } from './components/NoiseTexture'

export default {
  title: '02 · Elite tier',
}

export const AuroraOrbsDemo: Story = () => (
  <div className="relative card !p-12 min-h-[320px] overflow-hidden max-w-5xl">
    <AuroraOrbs />
    <p className="relative font-display text-3xl">Three blurred radial gradients drifting.</p>
  </div>
)

export const ParticleFieldDemo: Story = () => (
  <div className="relative card !p-12 min-h-[320px] overflow-hidden max-w-5xl">
    <ParticleField count={70} />
    <p className="relative font-display text-3xl">
      Move your cursor. The particles repel.
    </p>
  </div>
)

export const GradientMeshDemo: Story = () => (
  <div className="relative card !p-12 min-h-[320px] overflow-hidden max-w-5xl">
    <GradientMesh />
    <NoiseTexture opacity={0.06} />
    <p className="relative font-display text-3xl">
      Five blobs of color, one filmic noise overlay.
    </p>
  </div>
)

export const BlurTextDemo: Story = () => {
  // Force re-mount to retrigger animation
  useEffect(() => {}, [])
  return (
    <h2 className="font-display text-5xl max-w-3xl">
      <BlurText key={Math.random()} text="Words land like film cells." stagger={0.04} blur={10} />
    </h2>
  )
}

export const MarqueeLogosDemo: Story = () => (
  <div className="card !p-6 max-w-5xl">
    <MarqueeLogos
      duration={28}
      items={[
        { label: 'HoistOS', icon: <Sparkles size={18} strokeWidth={1.5} /> },
        { label: 'Perennial Empire', icon: <Cpu size={18} strokeWidth={1.5} /> },
        { label: 'EmpireWorks', icon: <Layers size={18} strokeWidth={1.5} /> },
        { label: 'Anthropic', icon: <Zap size={18} strokeWidth={1.5} /> },
      ]}
    />
  </div>
)

export const GlitchTextDemo: Story = () => (
  <h2 className="font-display text-7xl text-center">
    We <GlitchText text="ship" mode="hover" /> daily.
  </h2>
)

export const NoiseTextureDemo: Story = () => (
  <div
    className="relative card !p-12 min-h-[240px] max-w-5xl overflow-hidden"
    style={{ background: 'rgb(var(--color-accent))', color: 'rgb(var(--color-bg))' }}
  >
    <NoiseTexture opacity={0.18} />
    <p className="relative font-display text-3xl">
      SVG turbulence overlay. Filmic grain on flat color.
    </p>
  </div>
)
