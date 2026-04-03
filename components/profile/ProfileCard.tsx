// components/profile/ProfileCard.tsx
import Link from 'next/link'
import { MapPin, GraduationCap } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from './RatingStars'
import { TrustBadges } from './TrustBadges'
import { WhatsAppButton } from '../chat/WhatsAppButton'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  user: {
    id: string
    name: string
    profileImage?: string | null
    college?: string | null
    department?: string | null
    year?: string | null
    avgRating: number
    ratingCount: number
    completedGigs: number
    bio?: string | null
    whatsappNumber?: string | null
  }
  className?: string
  compact?: boolean
}

export function ProfileCard({ user, className, compact = false }: ProfileCardProps) {
  if (compact) {
    return (
      <Link
        href={`/profile/${user.id}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors',
          className
        )}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.profileImage || ''} alt={user.name} />
          <AvatarFallback name={user.name} className="text-sm" />
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{user.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <RatingStars rating={user.avgRating} size="sm" showValue />
            {user.college && (
              <span className="text-xs text-muted-foreground truncate">· {user.college}</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-white shadow-card p-5', className)}>
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarImage src={user.profileImage || ''} alt={user.name} />
          <AvatarFallback name={user.name} className="text-lg" />
        </Avatar>

        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${user.id}`}
            className="text-base font-bold hover:text-brand-600 transition-colors leading-tight"
          >
            {user.name}
          </Link>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {user.college && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                {user.college}
                {user.department && ` · ${user.department}`}
              </span>
            )}
            {user.year && (
              <span className="text-xs text-muted-foreground">{user.year}</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <RatingStars rating={user.avgRating} size="sm" showValue />
            <span className="text-xs text-muted-foreground">
              {user.completedGigs} completed
            </span>
          </div>
        </div>
      </div>

      {user.bio && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {user.bio}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <TrustBadges
          rating={user.avgRating}
          completedGigs={user.completedGigs}
          ratingCount={user.ratingCount}
          size="sm"
        />
        {user.whatsappNumber && (
          <div className="shrink-0 scale-90 origin-right">
            <WhatsAppButton phoneNumber={user.whatsappNumber} />
          </div>
        )}
      </div>
    </div>
  )
}
