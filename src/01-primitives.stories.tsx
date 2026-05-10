import type { Story } from '@ladle/react'
import { Sparkles, Zap, Layers, Cpu, ArrowRight, Database } from 'lucide-react'
import { Spotlight } from './components/Spotlight'
import { BentoGrid, BentoItem } from './components/BentoGrid'
import { Card3D } from './components/Card3D'
import { GradientText } from './components/GradientText'
import { TypewriterText } from './components/TypewriterText'
import { MagneticButton } from './components/MagneticButton'
import { BorderBeam } from './components/BorderBeam'

export default {
  title: '01 · Primitives',
}

export const Button: Story = () => (
  <div className="flex flex-wrap gap-3">
    <button className="btn btn-primary">Primary</button>
    <button className="btn btn-ghost">Ghost</button>
    <button className="btn btn-primary" disabled>
      Disabled
    </button>
  </div>
)

export const Card: Story = () => (
  <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
    <div className="card !p-6">
      <h3 className="font-display text-xl mb-2">Standard card</h3>
      <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Soft border + rounded 2xl. Hovers a touch.
      </p>
    </div>
    <div className="card !p-6">
      <h3 className="font-display text-xl mb-2">Hover me</h3>
      <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Border tint + shadow on hover.
      </p>
    </div>
  </div>
)

export const SpotlightCard: Story = () => (
  <Spotlight className="card !p-12 max-w-3xl" size={350}>
    <p className="font-display text-3xl mb-2">Move your cursor across this card.</p>
    <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
      Cursor-following radial gradient overlay.
    </p>
  </Spotlight>
)

export const BentoGridDemo: Story = () => (
  <div className="max-w-5xl">
    <BentoGrid>
      <BentoItem
        span="huge"
        title="Hero block"
        description="2x2. Anchor with the big idea."
        icon={<Sparkles size={20} strokeWidth={1.5} />}
      />
      <BentoItem title="Wide stat" description="Standard cell." icon={<Zap size={20} strokeWidth={1.5} />} />
      <BentoItem title="Standard" description="Most common cell." icon={<Layers size={20} strokeWidth={1.5} />} />
      <BentoItem
        span="wide"
        title="Wide section"
        description="Two columns wide."
        icon={<Database size={20} strokeWidth={1.5} />}
      />
      <BentoItem title="Last" description="Closes the grid." icon={<Cpu size={20} strokeWidth={1.5} />} />
    </BentoGrid>
  </div>
)

export const Card3DTilt: Story = () => (
  <div className="grid md:grid-cols-3 gap-6 max-w-5xl" style={{ perspective: '1200px' }}>
    {['Mouse-follow tilt', 'Spring damped', 'Theme aware'].map((t) => (
      <Card3D key={t} className="!p-8">
        <h4 className="font-display text-2xl mb-2">{t}</h4>
        <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Hover and move. Inertia springs back on leave.
        </p>
      </Card3D>
    ))}
  </div>
)

export const GradientTextDemo: Story = () => (
  <h2 className="font-display text-6xl">
    Build at the <GradientText>ceiling</GradientText>.
  </h2>
)

export const TypewriterDemo: Story = () => (
  <h2 className="font-display text-3xl max-w-3xl">
    <TypewriterText
      text="The AI grades itself, then kills itself if it's wrong."
      speed={28}
    />
  </h2>
)

export const MagneticButtonDemo: Story = () => (
  <div className="flex gap-3">
    <MagneticButton variant="primary">
      Magnetic
      <ArrowRight size={16} />
    </MagneticButton>
    <MagneticButton variant="ghost">Ghost</MagneticButton>
  </div>
)

export const BorderBeamDemo: Story = () => (
  <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
    <div className="card relative !p-8">
      <BorderBeam size={28} duration={5} />
      <h4 className="font-display text-2xl mb-2">With BorderBeam</h4>
      <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Conic gradient travels around the edge.
      </p>
    </div>
    <div className="card !p-8">
      <h4 className="font-display text-2xl mb-2">Without</h4>
      <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Compare side by side.
      </p>
    </div>
  </div>
)
