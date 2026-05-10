/**
 * Ladle stories for EmpireTimeline-a (Treatment A: vertical chronological
 * scrollytelling). Renders the full timeline with mock data so the visual can
 * be eyeballed in isolation via `npm run docs`.
 *
 * B2 Phase 2, S197 night, 2026-05-07.
 *
 * Hard Rule #11: zero em dashes.
 */

import type { Story } from '@ladle/react'
import EmpireTimelineA, {
  HeroSection,
  AhaSection,
  ScrollProgressRail,
} from './EmpireTimeline-a'
import { LenisProvider } from './LenisProvider'
import { MOCK_AHA_MOMENTS } from '../empire/content/types'

export default {
  title: 'B2 · Empire Timeline · Treatment A',
}

/**
 * Full timeline render. Wraps with LenisProvider so smooth scroll is wired
 * exactly as it will be at the /empire route in production.
 */
export const FullTimeline: Story = () => (
  <LenisProvider>
    <EmpireTimelineA moments={MOCK_AHA_MOMENTS} />
  </LenisProvider>
)

/**
 * Hero only. Use this to iterate on the spotlight + shiny-headline reveal
 * without scrolling past every aha section.
 */
export const HeroOnly: Story = () => (
  <div data-theme="hoistos-light" className="min-h-screen bg-[rgb(var(--color-bg))]">
    <HeroSection
      brandMark="HoistOS"
      headline="How Eugeen rebuilt his operating system"
      subhead="Seven aha moments, one continuous scroll. Each one foundational to the next."
    />
  </div>
)

/**
 * Single AhaSection in isolation. Renders the first mock moment so the
 * 40/60 sticky transform sequence can be tuned without scrolling past
 * upstream sections.
 */
export const SingleAhaSection: Story = () => {
  const moment = MOCK_AHA_MOMENTS[0]
  return (
    <LenisProvider>
      <div
        data-theme="hoistos-light"
        className="min-h-screen bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
      >
        {/* 100vh spacer so the sticky math has room to scrub */}
        <div style={{ height: '40vh' }} />
        <AhaSection
          moment={moment}
          index={0}
          total={1}
          onActivate={() => {}}
        />
        <div style={{ height: '40vh' }} />
      </div>
    </LenisProvider>
  )
}

/**
 * ScrollProgressRail in isolation. Renders against a tall scroll spacer so
 * the GSAP-drawn connector line + active-dot animation can be inspected.
 */
export const ScrollRailOnly: Story = () => (
  <LenisProvider>
    <div
      data-theme="hoistos-light"
      className="relative min-h-[400vh] bg-[rgb(var(--color-bg))] p-12"
    >
      <h1
        className="text-3xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Scroll-progress rail demo
      </h1>
      <p className="mt-4 max-w-md text-sm text-[rgb(var(--color-fg-muted))]">
        Scroll the page. The right-edge vertical rail draws its connector line
        as you advance. Hover any dot for a tooltip; click to jump.
      </p>
      <ScrollProgressRail
        moments={MOCK_AHA_MOMENTS}
        activeId={MOCK_AHA_MOMENTS[2].id}
      />
    </div>
  </LenisProvider>
)

/**
 * Reduced moment set (3 entries). Useful for quick layout iteration without
 * scrubbing through all 7 sticky sections.
 */
export const ThreeMoments: Story = () => (
  <LenisProvider>
    <EmpireTimelineA moments={MOCK_AHA_MOMENTS.slice(0, 3)} />
  </LenisProvider>
)
