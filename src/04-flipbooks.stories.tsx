import type { Story } from '@ladle/react'
import { Flipbook } from './components/Flipbook'
import { ScrollFlipbook } from './components/ScrollFlipbook'

export default {
  title: '04 · Flipbooks',
}

export const FlipbookStory: Story = () => (
  <Flipbook
    pages={[
      {
        id: 1,
        front: (
          <div className="flex flex-col h-full">
            <h4 className="font-display text-3xl leading-tight mb-3">Cover</h4>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Click any page to flip forward. Click again to flip back.
            </p>
          </div>
        ),
      },
      {
        id: 2,
        front: (
          <div className="flex flex-col h-full">
            <p className="font-mono text-xs mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
              01 · Problem
            </p>
            <h4 className="font-display text-2xl leading-tight mb-3">
              Slide-deck format kills attention.
            </h4>
          </div>
        ),
      },
      {
        id: 3,
        front: (
          <div className="flex flex-col h-full">
            <p className="font-mono text-xs mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
              02 · Solution
            </p>
            <h4 className="font-display text-2xl leading-tight mb-3">Render the deck as a 3D book.</h4>
          </div>
        ),
      },
      {
        id: 4,
        front: (
          <div className="flex flex-col h-full justify-end">
            <h4 className="font-display text-3xl leading-tight">Thanks for flipping.</h4>
          </div>
        ),
      },
    ]}
  />
)

export const ScrollFlipbookStory: Story = () => (
  <div>
    <p className="text-sm font-light mb-6" style={{ color: 'rgb(var(--color-fg-muted))' }}>
      Scroll inside this story to drive the frame index.
    </p>
    <ScrollFlipbook frameCount={48} />
  </div>
)
