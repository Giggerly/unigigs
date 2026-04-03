// components/profile/ReviewList.tsx
'use client'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { ReviewCard } from './ReviewCard'

interface Review {
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

interface ReviewListProps {
  reviews: Review[]
  emptyMessage?: string
}

export function ReviewList({ reviews, emptyMessage = 'No reviews yet' }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Reviews appear after completing gigs
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review, i) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <ReviewCard review={review} />
        </motion.div>
      ))}
    </div>
  )
}
