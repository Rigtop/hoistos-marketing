import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — merge Tailwind classes safely. shadcn pattern.
 * Usage: cn('text-base', condition && 'text-lg')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
