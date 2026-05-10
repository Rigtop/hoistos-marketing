import { motion } from 'motion/react'
import { DistortionImage } from './webgl/DistortionImage'
import { RGBShiftBackground } from './webgl/RGBShiftBackground'
import { Flipbook } from './Flipbook'
import { ScrollFlipbook } from './ScrollFlipbook'

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="border-t py-20"
      style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}
    >
      <div className="max-w-7xl mx-auto px-[8vw]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
          {label}
        </p>
        <h3 className="font-display text-4xl md:text-5xl mb-12 leading-tight">{title}</h3>
        {children}
      </div>
    </motion.section>
  )
}

export function ShaderShowcase() {
  // Sample image (replaceable). Using a free unsplash with CORS.
  const sampleImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop'

  return (
    <div>
      {/* RGB SHIFT BACKGROUND */}
      <section className="relative overflow-hidden border-t" style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}>
        <RGBShiftBackground />
        <div className="relative max-w-7xl mx-auto px-[8vw] py-32 z-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
            14 · RGBShiftBackground (WebGL)
          </p>
          <h3 className="font-display text-5xl md:text-6xl leading-tight mb-6">
            Generative shader background.
          </h3>
          <p className="text-base font-light max-w-2xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            Two layers of simplex noise blended with theme accent colors, chromatic split that scales
            with your scroll velocity, soft vignette. ogl renders 300 lines of GLSL into a single
            full-bleed plane. Try scrolling fast.
          </p>
        </div>
      </section>

      {/* DISTORTION IMAGE */}
      <Section label="15 · DistortionImage (WebGL)" title="Hover this image. Watch the UVs warp.">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <DistortionImage src={sampleImage} alt="Sample interior architecture" />
          <div>
            <p className="text-base leading-relaxed font-light mb-4" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              ogl + custom GLSL fragment shader. Cursor position drives a concentric ripple, a UV bend
              toward the mouse, and a slight chromatic split. All effects ease in/out smoothly with
              hover state.
            </p>
            <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              Use case: hero images, project cases, anywhere a static image earns more attention by
              becoming reactive.
            </p>
          </div>
        </div>
      </Section>

      {/* FLIPBOOK */}
      <Section label="16 · Flipbook (CSS 3D)" title="A pitch deck as a real book.">
        <div className="card !p-12 flex flex-col items-center">
          <Flipbook
            pages={[
              {
                id: 1,
                front: (
                  <div className="flex flex-col h-full">
                    <h4 className="font-display text-3xl leading-tight mb-3">Cover</h4>
                    <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                      Click any page to flip forward. Click again to flip back. Pure CSS 3D, no library.
                    </p>
                    <div className="mt-auto font-mono text-xs uppercase tracking-wider" style={{ color: 'rgb(var(--color-accent))' }}>
                      Pitch deck → real book
                    </div>
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
                    <h4 className="font-display text-2xl leading-tight mb-3">Slide-deck format kills attention.</h4>
                    <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                      Investors flip through 50 PDFs a week. Yours blends in. A flippable book breaks
                      the pattern.
                    </p>
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
                    <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                      Tactile feedback, real perspective, page sounds optional. The deck becomes the
                      first thing they remember.
                    </p>
                  </div>
                ),
              },
              {
                id: 4,
                front: (
                  <div className="flex flex-col h-full">
                    <p className="font-mono text-xs mb-3" style={{ color: 'rgb(var(--color-accent))' }}>
                      03 · The ask
                    </p>
                    <h4 className="font-display text-2xl leading-tight mb-3">$X at $Y valuation, 18-month runway.</h4>
                    <p className="text-sm font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                      Insert your terms here. Last page is closing.
                    </p>
                  </div>
                ),
              },
              {
                id: 5,
                front: (
                  <div className="flex flex-col h-full justify-end">
                    <h4 className="font-display text-3xl leading-tight">
                      Thanks for flipping.
                    </h4>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Section>

      {/* SCROLL FLIPBOOK */}
      <Section label="17 · ScrollFlipbook (Apple pattern)" title="Scroll. The frame advances.">
        <div className="text-sm font-light mb-6 max-w-2xl" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Apple's AirPods page pattern. A sticky canvas (or image sequence) cycles frames as you
          scroll through the section. Without real frames, the demo below renders procedurally on
          canvas. With a <code>framePattern</code> prop, swap in your image sequence.
        </div>
        <ScrollFlipbook frameCount={48} label="Keep scrolling" />
      </Section>
    </div>
  )
}
