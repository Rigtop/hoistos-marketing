import type { Story } from '@ladle/react'
import { Sparkles, Zap, Layers } from 'lucide-react'
import { HeroCentered } from './sections/HeroCentered'
import { HeroSplit } from './sections/HeroSplit'
import { HeroFullBleed } from './sections/HeroFullBleed'
import { FeatureGrid3Up } from './sections/FeatureGrid3Up'
import { FeatureAlternating } from './sections/FeatureAlternating'
import { PricingThreeTier } from './sections/PricingThreeTier'
import { TestimonialGrid } from './sections/TestimonialGrid'
import { FAQAccordion } from './sections/FAQAccordion'
import { CTABlock } from './sections/CTABlock'
import { FooterMultiCol } from './sections/FooterMultiCol'

export default {
  title: '07 · Sections',
}

export const HeroCenteredStory: Story = () => (
  <HeroCentered
    eyebrow="HoistOS"
    title="Construction OS for the next $185M company."
    subtitle="One platform for jobs, payroll, compliance, and field ops. Built by GCs."
    primaryCta={{ label: 'Request a demo' }}
    secondaryCta={{ label: 'Read the manifesto' }}
  />
)

export const HeroSplitStory: Story = () => (
  <HeroSplit
    eyebrow="What's inside"
    title="Field. Office. Compliance."
    subtitle="Three layers, one system. Daily logs, billing, certified payroll."
    primaryCta={{ label: 'See it' }}
    visual={
      <div
        className="card !p-16 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgb(var(--color-accent) / 0.5), rgb(var(--color-accent-2) / 0.3))',
        }}
      >
        <p className="font-display text-5xl">Visual</p>
      </div>
    }
  />
)

export const HeroFullBleedStory: Story = () => (
  <HeroFullBleed
    eyebrow="Manifesto"
    title="Construction software, finally good."
    subtitle="Built for crews that hate software. Loved by the office that needs reports."
  />
)

export const FeatureGrid3UpStory: Story = () => (
  <FeatureGrid3Up
    eyebrow="What you get"
    title="Three layers."
    features={[
      {
        icon: <Sparkles size={22} strokeWidth={1.5} />,
        title: 'Field',
        description: 'Daily logs, photos, time, materials.',
      },
      {
        icon: <Zap size={22} strokeWidth={1.5} />,
        title: 'Office',
        description: 'Estimating, billing, AP/AR, payroll.',
      },
      {
        icon: <Layers size={22} strokeWidth={1.5} />,
        title: 'Compliance',
        description: 'Certified payroll, Section 3, MWBE.',
      },
    ]}
  />
)

export const FeatureAlternatingStory: Story = () => (
  <FeatureAlternating
    rows={[
      {
        eyebrow: '01 · Field',
        title: 'Daily logs that crews actually fill out.',
        description: 'Photo + voice memo + auto-tag. Three taps from open to submit.',
        visual: (
          <div
            className="card !p-12 aspect-video flex items-center justify-center"
            style={{ background: 'rgb(var(--color-accent) / 0.1)' }}
          >
            <Sparkles size={48} style={{ color: 'rgb(var(--color-accent))' }} strokeWidth={1.2} />
          </div>
        ),
      },
      {
        eyebrow: '02 · Office',
        title: 'Billing pulls from the field automatically.',
        description: 'AIA G702/G703 from real labor + materials, no copy-paste.',
        visual: (
          <div
            className="card !p-12 aspect-video flex items-center justify-center"
            style={{ background: 'rgb(var(--color-accent-2) / 0.1)' }}
          >
            <Zap size={48} style={{ color: 'rgb(var(--color-accent-2))' }} strokeWidth={1.2} />
          </div>
        ),
      },
    ]}
  />
)

export const PricingThreeTierStory: Story = () => (
  <PricingThreeTier
    title="Pick a tier."
    tiers={[
      {
        name: 'Solo',
        price: '$199',
        cadence: '/mo',
        description: 'One user.',
        features: ['All field tools', 'Basic billing'],
        cta: { label: 'Start' },
      },
      {
        name: 'Crew',
        price: '$499',
        cadence: '/mo',
        description: 'Up to 25.',
        features: ['Everything in Solo', 'Office + payroll', 'Compliance pack'],
        cta: { label: 'Start' },
        featured: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: '25+.',
        features: ['Everything in Crew', 'SSO + SOC2', 'Dedicated rep'],
        cta: { label: 'Contact' },
      },
    ]}
  />
)

export const TestimonialGridStory: Story = () => (
  <TestimonialGrid
    title="What customers say."
    testimonials={[
      {
        quote: 'My foremen actually use it. That alone is worth the price.',
        author: 'Tony R.',
        role: 'GC owner',
        company: 'Brooklyn',
      },
      {
        quote: 'Closed our books 5 days early last month. Never happened before.',
        author: 'Liz M.',
        role: 'Bookkeeper',
        company: 'Queens',
      },
      {
        quote: 'Certified payroll just works. NYCHA never sent anything back.',
        author: 'Marcus S.',
        role: 'Compliance lead',
      },
      {
        quote: 'I switched from Procore. Lighter, faster, less of a tax to use.',
        author: 'Dee P.',
        role: 'PM',
        company: 'Bronx',
      },
    ]}
  />
)

export const FAQAccordionStory: Story = () => (
  <FAQAccordion
    title="Common questions."
    items={[
      { question: 'How long to onboard?', answer: 'Most crews are live in 2 weeks.' },
      { question: 'What about union jobs?', answer: 'Certified payroll baked in.' },
      { question: 'Do you integrate with QBO?', answer: 'Yes, two-way sync.' },
      {
        question: 'Can I bring my own data?',
        answer: 'CSV import for jobs, employees, vendors. We help.',
      },
    ]}
  />
)

export const CTABlockStory: Story = () => (
  <CTABlock
    title="Ready to see it?"
    subtitle="30-minute demo. No slides. Real screens."
    primaryCta={{ label: 'Book the demo' }}
    secondaryCta={{ label: 'Just send me docs' }}
  />
)

export const FooterMultiColStory: Story = () => (
  <FooterMultiCol
    brand={{ name: 'HoistOS', tagline: 'Construction OS for the next $185M company.' }}
    groups={[
      { heading: 'Product', links: [{ label: 'Field', href: '#' }, { label: 'Office', href: '#' }] },
      { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Careers', href: '#' }] },
      { heading: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] },
    ]}
  />
)
