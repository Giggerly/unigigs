// components/gigs/GigCardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function GigCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-soft p-4 space-y-3">
      {/* badges row */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      {/* title */}
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      {/* meta row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      {/* poster + price */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function GigFeedSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 4 on mobile is enough (above-fold), 6 on tablet+ */}
        {Array.from({ length: 4 }).map((_, i) => (
          <GigCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
