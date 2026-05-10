import { motion } from 'motion/react'
import { cn } from '../lib/utils'

type GridProps = {
  children: React.ReactNode
  className?: string
}

export function BentoGrid({ children, className = '' }: GridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[minmax(180px,auto)]', className)}>
      {children}
    </div>
  )
}

type ItemProps = {
  title: string
  description?: string
  children?: React.ReactNode
  /** "wide" = 2 cols, "tall" = 2 rows, "huge" = 2x2. Default = 1x1. */
  span?: 'wide' | 'tall' | 'huge'
  className?: string
  icon?: React.ReactNode
}

export function BentoItem({ title, description, children, span, className = '', icon }: ItemProps) {
  const spanClass =
    span === 'wide' ? 'md:col-span-2' :
    span === 'tall' ? 'md:row-span-2' :
    span === 'huge' ? 'md:col-span-2 md:row-span-2' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={cn(
        'card group relative flex flex-col overflow-hidden p-6',
        spanClass,
        className,
      )}
    >
      {icon && (
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 transition-colors"
          style={{ background: 'rgb(var(--color-accent) / 0.12)', color: 'rgb(var(--color-accent))' }}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-2xl mb-2 leading-tight">{title}</h3>
      {description && (
        <p className="text-sm leading-relaxed font-light" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          {description}
        </p>
      )}
      {children && <div className="mt-auto pt-4">{children}</div>}
    </motion.div>
  )
}
