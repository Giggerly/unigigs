// components/profile/ReviewCard.tsx
import { formatRelativeTime } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from './RatingStars'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment?: string | null
    createdAt: string
    reviewer: {
      id: string
      name: string
      profileImage?: string | null
      college?: string | null
    }
    gig: {
      id: string
      title: string
    }
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-border bg-white shadow-soft group hover:shadow-card transition-all duration-200">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={review.reviewer.profileImage || ''} alt={review.reviewer.name} />
        <AvatarFallback name={review.reviewer.name} className="text-xs" />
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold leading-tight">{review.reviewer.name}</p>
            {review.reviewer.college && (
              <p className="text-xs text-muted-foreground">{review.reviewer.college}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <RatingStars rating={review.rating} size="sm" />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>

        {review.comment && (
          <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
            {review.comment}
          </p>
        )}

        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5">
          <span className="text-[10px] text-muted-foreground">For:</span>
          <span className="text-[10px] font-medium text-foreground/80 truncate max-w-[180px]">
            {review.gig.title}
          </span>
        </div>
      </div>
    </div>
  )
}
