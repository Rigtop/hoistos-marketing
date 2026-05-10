/**
 * visual-stack section template library.
 *
 * Sections = composed full-width landing-page blocks.
 * Components (one folder up) = atomic primitives.
 *
 * Compose pages by importing 4-6 sections in App.tsx instead of building from scratch.
 *
 * Example:
 *   import { HeroCentered, FeatureGrid3Up, PricingThreeTier, TestimonialGrid, FAQAccordion, CTABlock, FooterMultiCol } from './sections'
 *
 *   <HeroCentered title="..." subtitle="..." primaryCta={{ label: 'Start' }} />
 *   <FeatureGrid3Up title="..." features={[...]} />
 *   <PricingThreeTier title="..." tiers={[...]} />
 *   <TestimonialGrid title="..." testimonials={[...]} />
 *   <FAQAccordion title="..." items={[...]} />
 *   <CTABlock title="..." primaryCta={{ label: 'Talk to us' }} />
 *   <FooterMultiCol brand={{ name: '...' }} groups={[...]} />
 */

export { HeroCentered } from './HeroCentered'
export { HeroSplit } from './HeroSplit'
export { HeroFullBleed } from './HeroFullBleed'
export { FeatureGrid3Up } from './FeatureGrid3Up'
export { FeatureAlternating } from './FeatureAlternating'
export { PricingThreeTier } from './PricingThreeTier'
export { TestimonialGrid } from './TestimonialGrid'
export { FAQAccordion } from './FAQAccordion'
export { CTABlock } from './CTABlock'
export { FooterMultiCol } from './FooterMultiCol'
