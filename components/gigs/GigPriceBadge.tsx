// components/gigs/GigPriceBadge.tsx
import { cn, formatCurrency } from '@/lib/utils'
import { ArrowLeftRight } from 'lucide-react'

interface GigPriceBadgeProps {
  budget: number
  isNegotiable: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function GigPriceBadge({ budget, isNegotiable, className, size = 'md' }: GigPriceBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'font-bold tabular-nums text-brand-700',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-2xl'
        )}
      >
        {formatCurrency(budget)}
      </span>
      {isNegotiable && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
          <ArrowLeftRight className="h-2.5 w-2.5" />
          Negotiable
        </span>
      )}
    </div>
  )
}
