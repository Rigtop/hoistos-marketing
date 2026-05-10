/**
 * Ladle stories for EmpireTimeline-b (Treatment B: horizontal Apple-keynote
 * 3D camera-dolly tunnel). Renders the full timeline with mock data and a
 * handful of focused stories so the visual can be eyeballed in isolation
 * via `npm run docs`.
 *
 * B2 Phase 3, S197 night, 2026-05-07.
 *
 * Hard Rule #11: zero em dashes.
 */

import type { Story } from '@ladle/react'
import EmpireTimelineB from './EmpireTimeline-b'
import { LenisProvider } from './LenisProvider'
import { MOCK_AHA_MOMENTS } from '../empire/content/types'

export default {
  title: 'B2 · Empire Timeline · Treatment B',
}

/**
 * Full tunnel render. Wraps with LenisProvider so smooth-scroll cooperates
 * with the canvas wheel listener in production. The canvas itself fills the
 * viewport, so wrap in a 100vh container.
 */
export const FullTunnel: Story = () => (
  <LenisProvider>
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineB moments={MOCK_AHA_MOMENTS} />
    </div>
  </LenisProvider>
)

/**
 * Three moments only. Faster Hot Module Reload iteration when tuning camera
 * dolly speed, panel scale, and overlay typography without scrubbing through
 * all seven panels.
 */
export const ThreeMoments: Story = () => (
  <LenisProvider>
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineB moments={MOCK_AHA_MOMENTS.slice(0, 3)} />
    </div>
  </LenisProvider>
)

/**
 * Single moment. Verifies the tunnel handles the degenerate case (one panel,
 * no rail extension, no nav controls beyond Esc) without console errors.
 */
export const SingleMoment: Story = () => (
  <LenisProvider>
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineB moments={MOCK_AHA_MOMENTS.slice(0, 1)} />
    </div>
  </LenisProvider>
)

/**
 * Custom branding. Demonstrates the brandMark and preview tag are theme-able
 * for VPs who want to host the timeline under their own division name.
 */
export const CustomBranding: Story = () => (
  <LenisProvider>
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineB
        moments={MOCK_AHA_MOMENTS}
        brandMark="Perennial Empire"
        preview="VP preview cut"
        exitHref="#"
      />
    </div>
  </LenisProvider>
)

/**
 * Reverse-chronological. Asserts the component sorts internally regardless
 * of input order, so the upstream loader is free to deliver moments in any
 * order without breaking the camera-dolly index math.
 */
export const ReverseChronologicalInput: Story = () => (
  <LenisProvider>
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineB moments={[...MOCK_AHA_MOMENTS].reverse()} />
    </div>
  </LenisProvider>
)
