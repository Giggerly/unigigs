// components/profile/ProfileStats.tsx
import { Star, Briefcase, MessageSquare, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileStatsProps {
  avgRating: number
  ratingCount: number
  completedGigs: number
  postedGigs?: number
  className?: string
  compact?: boolean
}

export function ProfileStats({
  avgRating,
  ratingCount,
  completedGigs,
  postedGigs,
  className,
  compact = false,
}: ProfileStatsProps) {
  const stats = [
    {
      icon: Star,
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      label: `${ratingCount} review${ratingCount !== 1 ? 's' : ''}`,
      iconColor: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Briefcase,
      value: completedGigs,
      label: 'Completed',
      iconColor: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    ...(postedGigs !== undefined
      ? [{
          icon: TrendingUp,
          value: postedGigs,
          label: 'Posted',
          iconColor: 'text-brand-600',
          bg: 'bg-brand-50',
        }]
      : []),
  ]

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <stat.icon className={cn('h-3.5 w-3.5', stat.iconColor)} />
            <span className="text-sm font-semibold">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-3', postedGigs !== undefined ? 'grid-cols-3' : 'grid-cols-2', className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-white p-4 shadow-soft"
        >
          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', stat.bg)}>
            <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
          </div>
          <span className="text-xl font-bold tracking-tight">{stat.value}</span>
          <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
