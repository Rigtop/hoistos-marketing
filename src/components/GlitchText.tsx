import { cn } from '../lib/utils'

type Props = {
  text: string
  className?: string
  /** Trigger mode: 'always' loops; 'hover' fires on cursor enter. Default 'hover'. */
  mode?: 'always' | 'hover'
  /** RGB shift amount in px. Default 3. */
  shift?: number
}

/**
 * GlitchText — RGB-shift glitch effect on text.
 * Pure CSS via clip-path keyframes + duplicated layered text.
 * Three layers: red, cyan, base. Animates clip-path to reveal slices.
 */
export function GlitchText({ text, className = '', mode = 'hover', shift = 3 }: Props) {
  const id = `glitch-${Math.random().toString(36).slice(2, 9)}`
  const animState = mode === 'always' ? 'running' : 'paused'

  return (
    <span className={cn('relative inline-block', mode === 'hover' && 'group', className)}>
      <style>{`
        @keyframes glitch-${id}-r {
          0%,100% { clip-path: polygon(0 0, 100% 0, 100% 30%, 0 30%); }
          20% { clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%); }
          40% { clip-path: polygon(0 10%, 100% 10%, 100% 25%, 0 25%); }
          60% { clip-path: polygon(0 80%, 100% 80%, 100% 100%, 0 100%); }
          80% { clip-path: polygon(0 40%, 100% 40%, 100% 50%, 0 50%); }
        }
        @keyframes glitch-${id}-c {
          0%,100% { clip-path: polygon(0 70%, 100% 70%, 100% 100%, 0 100%); }
          20% { clip-path: polygon(0 5%, 100% 5%, 100% 25%, 0 25%); }
          40% { clip-path: polygon(0 50%, 100% 50%, 100% 65%, 0 65%); }
          60% { clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%); }
          80% { clip-path: polygon(0 80%, 100% 80%, 100% 95%, 0 95%); }
        }
        .glitch-${id}-r {
          animation: glitch-${id}-r 1.5s steps(1) infinite ${animState};
        }
        .glitch-${id}-c {
          animation: glitch-${id}-c 1.7s steps(1) infinite ${animState};
        }
        ${mode === 'hover' ? `
        .group:hover .glitch-${id}-r,
        .group:hover .glitch-${id}-c {
          animation-play-state: running;
        }` : ''}
      `}</style>
      <span aria-hidden className={`absolute inset-0 glitch-${id}-r`} style={{ color: '#ff3b3b', transform: `translate(${shift}px, 0)`, mixBlendMode: 'screen' }}>
        {text}
      </span>
      <span aria-hidden className={`absolute inset-0 glitch-${id}-c`} style={{ color: '#3bf0ff', transform: `translate(-${shift}px, 0)`, mixBlendMode: 'screen' }}>
        {text}
      </span>
      <span className="relative">{text}</span>
    </span>
  )
}
