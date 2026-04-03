// components/profile/RatingSummary.tsx
import { cn } from '@/lib/utils'

interface RatingSummaryProps {
  avgRating: number
  ratingCount: number
  distribution?: Record<string, number>
  className?: string
}

export function RatingSummary({ avgRating, ratingCount, distribution, className }: RatingSummaryProps) {
  const defaultDist = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  const dist = distribution || defaultDist
  const total = ratingCount || 1

  return (
    <div className={cn('flex items-start gap-6 p-5 rounded-2xl border border-border bg-white shadow-soft', className)}>
      {/* Big score */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-5xl font-bold tracking-tighter">
          {avgRating > 0 ? avgRating.toFixed(1) : '—'}
        </span>
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 12 12" className="h-3 w-3">
              <path
                d="M6 0.5L7.545 4.115L11.511 4.624L8.756 7.28L9.511 11.224L6 9.25L2.489 11.224L3.244 7.28L0.489 4.624L4.455 4.115L6 0.5Z"
                fill={i < Math.round(avgRating) ? '#fbbf24' : '#e5e7eb'}
              />
            </svg>
          ))}
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {ratingCount} review{ratingCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = dist[star.toString()] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-3 shrink-0">{star}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                {count > 0 ? count : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
