import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-orange-100 text-orange-700',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: string
}

export function Badge({ className, variant = 'draft', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusColors[variant] ?? statusColors.draft,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
