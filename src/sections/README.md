# sections/

Pre-built, copy-paste page sections for fast deliverables. Compose 4-6 sections in `App.tsx` to ship a full landing page in <30 minutes.

## Sections shipped

| File | What it is |
|---|---|
| `HeroCentered.tsx` | Centered title + subtitle + dual CTA, aurora orbs background. Default-safe hero. |
| `HeroSplit.tsx` | Copy left / visual right (or reversed). Use when you have a real product shot. |
| `HeroFullBleed.tsx` | Full-screen GradientMesh + NoiseTexture under center text. Manifesto-tier. |
| `FeatureGrid3Up.tsx` | Three-column feature row with icons. Classic "what you get". |
| `FeatureAlternating.tsx` | Text-image rows that flip side per row. Each feature gets visual real estate. |
| `PricingThreeTier.tsx` | Three pricing tiers, middle optionally featured with BorderBeam. |
| `TestimonialGrid.tsx` | Masonry-style testimonial grid (2-col md, 3-col lg). |
| `FAQAccordion.tsx` | Accessible accordion, plus-to-X icon rotation, smooth height. |
| `CTABlock.tsx` | Closing CTA with Spotlight cursor effect + GradientText title. |
| `FooterMultiCol.tsx` | Logo + tagline left, link columns center, socials + copyright bottom. |

## Compose a landing page in `App.tsx`

```tsx
import { Sparkles, Zap, Layers } from 'lucide-react'
import {
  HeroCentered,
  FeatureGrid3Up,
  PricingThreeTier,
  TestimonialGrid,
  FAQAccordion,
  CTABlock,
  FooterMultiCol,
} from './sections'

function App() {
  return (
    <>
      <HeroCentered
        eyebrow="HoistOS"
        title="Construction OS for the next $185M company."
        subtitle="One platform for jobs, payroll, compliance, and field ops. Built by GCs."
        primaryCta={{ label: 'Request a demo' }}
        secondaryCta={{ label: 'Read the manifesto' }}
      />
      <FeatureGrid3Up
        eyebrow="What's inside"
        title="Three layers, one system."
        features={[
          { icon: <Sparkles size={22} strokeWidth={1.5} />, title: 'Field', description: 'Daily logs, photos, time, materials.' },
          { icon: <Zap size={22} strokeWidth={1.5} />, title: 'Office', description: 'Estimating, billing, AP/AR, payroll.' },
          { icon: <Layers size={22} strokeWidth={1.5} />, title: 'Compliance', description: 'Certified payroll, Section 3, MWBE.' },
        ]}
      />
      <PricingThreeTier
        title="Pick a tier."
        tiers={[
          { name: 'Solo', price: '$199', cadence: '/mo', description: '1 user.', features: ['All field tools', 'Basic billing'], cta: { label: 'Start' } },
          { name: 'Crew', price: '$499', cadence: '/mo', description: 'Up to 25.', features: ['Everything in Solo', 'Office + payroll', 'Compliance pack'], cta: { label: 'Start' }, featured: true },
          { name: 'Enterprise', price: 'Custom', description: '25+.', features: ['Everything in Crew', 'SSO + SOC2', 'Dedicated rep'], cta: { label: 'Contact' } },
        ]}
      />
      <TestimonialGrid
        title="What customers say."
        testimonials={[/* ... */]}
      />
      <FAQAccordion
        title="Common questions."
        items={[
          { question: 'How long to onboard?', answer: 'Most crews are live in 2 weeks.' },
          { question: 'What about union jobs?', answer: 'Certified payroll baked in.' },
        ]}
      />
      <CTABlock
        title="Ready to see it?"
        subtitle="30-minute demo. No slides. Real screens."
        primaryCta={{ label: 'Book the demo' }}
      />
      <FooterMultiCol
        brand={{ name: 'HoistOS', tagline: 'Construction OS.' }}
        groups={[
          { heading: 'Product', links: [{ label: 'Field', href: '#' }, { label: 'Office', href: '#' }] },
          { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Careers', href: '#' }] },
          { heading: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] },
        ]}
      />
    </>
  )
}
```

That's a complete landing page in ~50 lines of JSX. The Tailwind themes (HoistOS / Claude Design) handle all the styling automatically.

## Pattern: components vs sections

- **`src/components/`** = atomic primitives (buttons, cards, motion effects, shaders). Reusable across many sections.
- **`src/sections/`** = composed full-width page blocks. Drop into `App.tsx`, customize via props.

When you need something that's not here, write a new section that imports primitives from `components/`. Don't duplicate primitive logic in sections.

## Theme behavior

Every section uses CSS vars (`rgb(var(--color-accent))` etc.) so they automatically pick up the active theme (HoistOS or Claude Design). Switching themes via `<ThemeToggle />` re-skins all sections instantly without remount.
