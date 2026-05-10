import type { ReactNode, MouseEvent } from 'react'
import { useViewTransition } from './useViewTransition'

type Props = {
  to: string
  onNavigate: (to: string) => void
  children: ReactNode
  className?: string
  /** Element morph names to set on the link itself. */
  viewTransitionName?: string
}

/**
 * ViewTransitionLink: anchor that calls onNavigate inside a View Transition.
 *
 * For SPA-style routing without React Router. Drop into any nav. Set
 * style[viewTransitionName] on shared elements (logo, hero image) to morph
 * them between routes.
 */
export function ViewTransitionLink({ to, onNavigate, children, className, viewTransitionName }: Props) {
  const transition = useViewTransition()

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    transition(() => onNavigate(to))
  }

  return (
    <a
      href={to}
      onClick={onClick}
      className={className}
      style={viewTransitionName ? ({ viewTransitionName } as React.CSSProperties) : undefined}
    >
      {children}
    </a>
  )
}
