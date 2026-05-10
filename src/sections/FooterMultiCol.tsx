type LinkGroup = {
  heading: string
  links: { label: string; href: string }[]
}

type Props = {
  brand: { name: string; tagline?: string }
  groups: LinkGroup[]
  socials?: { label: string; href: string; icon?: React.ReactNode }[]
  legal?: string
}

/**
 * FooterMultiCol — branded multi-column footer with link groups + socials.
 * The closer. Logo + tagline left, link columns center, copyright bottom.
 */
export function FooterMultiCol({ brand, groups, socials, legal }: Props) {
  return (
    <footer
      className="px-[8vw] pt-20 pb-10 border-t"
      style={{
        borderColor: 'rgb(var(--color-border) / 0.2)',
        background: 'rgb(var(--color-surface))',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[2fr_3fr] gap-12 mb-16">
          <div>
            <div className="font-display text-3xl mb-3">{brand.name}</div>
            {brand.tagline && (
              <p className="text-sm font-light max-w-xs leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                {brand.tagline}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {groups.map((g) => (
              <div key={g.heading}>
                <h4
                  className="font-mono text-xs uppercase tracking-[0.18em] mb-4"
                  style={{ color: 'rgb(var(--color-fg-subtle))' }}
                >
                  {g.heading}
                </h4>
                <ul className="space-y-2.5">
                  {g.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm hover:underline transition-colors"
                        style={{ color: 'rgb(var(--color-fg-muted))' }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div
          className="border-t pt-8 flex flex-wrap items-center justify-between gap-4"
          style={{ borderColor: 'rgb(var(--color-border) / 0.2)' }}
        >
          <p className="font-mono text-xs" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
            {legal ?? `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`}
          </p>
          {socials && socials.length > 0 && (
            <div className="flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'rgb(var(--color-fg-muted))' }}
                  aria-label={s.label}
                >
                  {s.icon ?? s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
