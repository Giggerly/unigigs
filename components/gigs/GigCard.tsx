// components/gigs/GigCard.tsx
'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, MapPin, Users, Eye, Zap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GigStatusBadge } from './GigStatusBadge'
import { GigPriceBadge } from './GigPriceBadge'
import { RatingStars } from '@/components/profile/RatingStars'
import { GIG_CATEGORIES } from '@/lib/constants'
import { getDeadlineLabel, isUrgentDeadline, truncate, cn } from '@/lib/utils'

interface GigCardProps {
  gig: {
    id: string
    title: string
    description: string
    category: string
    budget: number
    isNegotiable: boolean
    deadline: string
    isUrgent: boolean
    locationMode: string
    status: string
    viewCount: number
    poster: {
      id: string
      name: string
      profileImage?: string | null
      college?: string | null
      avgRating: number
    }
    _count?: { applications: number }
  }
  index?: number
  variant?: 'default' | 'compact'
}

export function GigCard({ gig, index = 0, variant = 'default' }: GigCardProps) {
  const router = useRouter()
  const categoryConfig = GIG_CATEGORIES.find((c) => c.value === gig.category)
  const deadlineLabel = getDeadlineLabel(gig.deadline)
  const isDeadlineUrgent = isUrgentDeadline(gig.deadline)
  const isUrgentGig = gig.isUrgent || isDeadlineUrgent

  if (variant === 'compact') {
    return (
      <Link href={`/gigs/${gig.id}`}>
        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
          <span className="text-xl">{categoryConfig?.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-brand-600 transition-colors">
              {gig.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-brand-700">₹{gig.budget.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{deadlineLabel}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/gigs/${gig.id}`} className="block group">
        <div
          className={cn(
            'relative bg-white rounded-2xl border border-border shadow-card overflow-hidden',
            'transition-all duration-200 ease-out',
            'active:scale-[0.985]',          // mobile press feedback
            'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-brand-100',
          )}
        >
          {/* Urgent stripe */}
          {isUrgentGig && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-400" />
          )}

          <div className="p-4">
            {/* Row 1: category pill + status + urgent badge */}
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0',
                  categoryConfig?.color
                )}
              >
                <span>{categoryConfig?.emoji}</span>
                {categoryConfig?.label}
              </span>
              <GigStatusBadge status={gig.status as any} />
              {isUrgentGig && (
                <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 shrink-0">
                  <Zap className="h-3 w-3 fill-current" />
                  Urgent
                </span>
              )}
            </div>

            {/* Row 2: title */}
            <h3 className="font-semibold text-foreground text-sm leading-snug mb-1.5 group-hover:text-brand-600 transition-colors line-clamp-2">
              {gig.title}
            </h3>

            {/* Row 3: meta chips — deadline, location, views */}
            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className={cn('h-3 w-3 shrink-0', isDeadlineUrgent && 'text-red-500')} />
                <span className={isDeadlineUrgent ? 'text-red-600 font-semibold' : ''}>
                  {deadlineLabel}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {gig.locationMode === 'ONLINE'
                  ? 'Online'
                  : gig.locationMode === 'ON_CAMPUS'
                  ? 'On Campus'
                  : 'Flexible'}
              </span>
              {gig._count?.applications !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 shrink-0" />
                  {gig._count.applications}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 shrink-0" />
                {gig.viewCount}
              </span>
            </div>

            {/* Row 4: poster + price */}
            <div className="flex items-center justify-between gap-2">
              <div
                role="link"
                tabIndex={0}
                className="flex items-center gap-1.5 group/poster cursor-pointer min-w-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/profile/${gig.poster.id}`)
                }}
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={gig.poster.profileImage || ''} alt={gig.poster.name} />
                  <AvatarFallback name={gig.poster.name} className="text-[9px]" />
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-none truncate group-hover/poster:text-brand-600 transition-colors">
                    {gig.poster.name.split(' ')[0]}
                  </p>
                  <div className="mt-0.5">
                    <RatingStars rating={gig.poster.avgRating} size="sm" showValue />
                  </div>
                </div>
              </div>

              <GigPriceBadge budget={gig.budget} isNegotiable={gig.isNegotiable} size="md" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
