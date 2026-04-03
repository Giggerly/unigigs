// components/gigs/GigStatusBadge.tsx
import { cn } from '@/lib/utils'
import { GIG_STATUS_CONFIG } from '@/lib/constants'

interface GigStatusBadgeProps {
  status: keyof typeof GIG_STATUS_CONFIG
  className?: string
}

export function GigStatusBadge({ status, className }: GigStatusBadgeProps) {
  const config = GIG_STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
