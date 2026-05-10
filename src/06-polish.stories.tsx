import { useState } from 'react'
import type { Story } from '@ladle/react'
import { PartyPopper } from 'lucide-react'
import { ScrollProgressBar } from './components/ScrollProgressBar'
import { Confetti } from './components/Confetti'
import { ImageLightbox } from './components/ImageLightbox'
import { StickyHorizontalScroll } from './components/StickyHorizontalScroll'

export default {
  title: '06 · Polish',
}

export const ScrollProgressBarStory: Story = () => (
  <div style={{ height: '200vh' }}>
    <ScrollProgressBar />
    <p className="font-display text-4xl">Scroll. Watch the top of the viewport.</p>
    <p className="font-light text-sm mt-4" style={{ color: 'rgb(var(--color-fg-muted))' }}>
      Spring-smoothed orange bar pinned to viewport top, fills with scroll position.
    </p>
  </div>
)

export const ConfettiStory: Story = () => {
  const [trigger, setTrigger] = useState(0)
  return (
    <div className="card !p-12 text-center max-w-3xl">
      <button onClick={() => setTrigger(Date.now())} className="btn btn-primary">
        <PartyPopper size={16} /> Fire confetti
      </button>
      <Confetti trigger={trigger} />
    </div>
  )
}

const SAMPLE_1 = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop'
const SAMPLE_2 = 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&auto=format&fit=crop'
const SAMPLE_3 = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1600&auto=format&fit=crop'

export const ImageLightboxStory: Story = () => (
  <div className="grid md:grid-cols-3 gap-4 max-w-5xl">
    <ImageLightbox src={SAMPLE_1} alt="Sample 1" caption="Click to expand. Esc to close." />
    <ImageLightbox src={SAMPLE_2} alt="Sample 2" caption="Shared-element morph." />
    <ImageLightbox src={SAMPLE_3} alt="Sample 3" caption="Body scroll locked." />
  </div>
)

export const StickyHorizontalScrollStory: Story = () => (
  <StickyHorizontalScroll scrollLength={4}>
    {[
      { num: '01', title: 'Scroll', body: 'Vertical drives horizontal.' },
      { num: '02', title: 'Lands', body: 'Each panel fills viewport.' },
      { num: '03', title: 'Smooth', body: 'Motion useScroll-driven.' },
      { num: '04', title: 'Done', body: 'Last panel exits.' },
    ].map((p) => (
      <div key={p.num} className="card !p-16 text-center max-w-2xl">
        <p
          className="font-mono text-xs uppercase tracking-[0.3em] mb-4"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          {p.num}
        </p>
        <h4 className="font-display text-5xl md:text-7xl leading-tight mb-4">{p.title}</h4>
        <p className="text-base font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          {p.body}
        </p>
      </div>
    ))}
  </StickyHorizontalScroll>
)
