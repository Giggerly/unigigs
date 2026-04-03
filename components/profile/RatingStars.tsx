// components/profile/RatingStars.tsx
'use client'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const partial = !filled && i < rating

          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
              className={cn(
                'relative transition-transform',
                interactive && 'hover:scale-110 cursor-pointer',
                !interactive && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  'transition-colors',
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : partial
                    ? 'fill-amber-200 text-amber-300'
                    : 'fill-muted text-muted-foreground/30'
                )}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className={cn(
          'font-semibold tabular-nums',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  )
}
