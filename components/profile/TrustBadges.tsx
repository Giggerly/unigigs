// components/profile/TrustBadges.tsx
import { Shield, Star, Zap, CheckCircle, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadgesProps {
  rating: number
  completedGigs: number
  ratingCount: number
  isVerified?: boolean
  size?: 'sm' | 'md'
  className?: string
}

interface Badge {
  icon: React.ElementType
  label: string
  color: string
  condition: boolean
}

export function TrustBadges({
  rating,
  completedGigs,
  ratingCount,
  isVerified = true,
  size = 'md',
  className,
}: TrustBadgesProps) {
  const badges: Badge[] = [
    {
      icon: CheckCircle,
      label: 'Verified',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      condition: isVerified,
    },
    {
      icon: Star,
      label: 'Top Rated',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      condition: rating >= 4.5 && ratingCount >= 5,
    },
    {
      icon: Award,
      label: 'Power User',
      color: 'text-brand-600 bg-brand-50 border-brand-100',
      condition: completedGigs >= 20,
    },
    {
      icon: Zap,
      label: 'Fast Responder',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      condition: completedGigs >= 5,
    },
    {
      icon: Shield,
      label: 'Trusted',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      condition: completedGigs >= 10 && rating >= 4.0,
    },
  ]

  const activeBadges = badges.filter((b) => b.condition)
  if (activeBadges.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {activeBadges.map((badge) => (
        <span
          key={badge.label}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border font-medium',
            badge.color,
            size === 'sm'
              ? 'text-[10px] px-2 py-0.5'
              : 'text-xs px-2.5 py-1'
          )}
        >
          <badge.icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
          {badge.label}
        </span>
      ))}
    </div>
  )
}
