import type { Story } from '@ladle/react'
import { DistortionImage } from './components/webgl/DistortionImage'
import { LiquidHover } from './components/webgl/LiquidHover'
import { RGBShiftBackground } from './components/webgl/RGBShiftBackground'
import { FloatingGeometry } from './components/FloatingGeometry'
import { ScrollTube3D } from './components/webgl/ScrollTube3D'

export default {
  title: '03 · Shaders + 3D',
}

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop'

export const DistortionImageStory: Story = () => (
  <div className="max-w-3xl">
    <DistortionImage src={SAMPLE_IMAGE} alt="Sample" />
  </div>
)

export const LiquidHoverStory: Story = () => (
  <div className="max-w-3xl">
    <LiquidHover src={SAMPLE_IMAGE} alt="Sample" />
  </div>
)

export const RGBShiftBackgroundStory: Story = () => (
  <div className="relative card !p-12 min-h-[480px] overflow-hidden max-w-6xl">
    <RGBShiftBackground />
    <p className="relative font-display text-4xl">Generative shader background.</p>
  </div>
)

export const FloatingGeometryStory: Story = () => (
  <div className="relative card min-h-[480px] overflow-hidden max-w-6xl">
    <FloatingGeometry />
  </div>
)

const TUBE_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&auto=format&fit=crop',
]

export const ScrollTube3DStory: Story = () => (
  <div className="relative" style={{ height: '200vh' }}>
    <div className="sticky top-0 h-screen relative overflow-hidden">
      <ScrollTube3D images={TUBE_IMAGES} radius={3.5} />
      <p
        className="absolute bottom-12 left-1/2 -translate-x-1/2 font-display text-3xl text-center"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        Scroll the parent page. The tube turns.
      </p>
    </div>
  </div>
)
