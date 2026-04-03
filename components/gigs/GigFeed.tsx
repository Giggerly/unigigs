// components/gigs/GigFeed.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useGigs } from '@/hooks/useGigs'
import { useFilterStore } from '@/store/filterStore'
import { GigCard } from './GigCard'
import { GigFeedSkeleton } from './GigCardSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'

export function GigFeed() {
  const { data, isLoading, isError, refetch } = useGigs()
  const { filters, setFilter } = useFilterStore()

  if (isLoading) return <GigFeedSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <span className="text-3xl">😕</span>
        <p className="text-sm text-muted-foreground">Something went wrong loading gigs.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    )
  }

  if (!data?.gigs?.length) {
    return (
      <EmptyState
        icon="🔍"
        title="No gigs found"
        description="Try adjusting your filters or search. New gigs are posted every day!"
        action={{ label: 'Post a Gig', href: '/gigs/create' }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{data.total}</span>{' '}
          gig{data.total !== 1 ? 's' : ''} found
        </p>
        {data.totalPages > 1 && (
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
        )}
      </div>

      {/* Grid — single col on mobile, 2 col sm+, 3 col lg+ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={JSON.stringify(filters)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {data.gigs.map((gig: any, i: number) => (
            <GigCard key={gig.id} gig={gig} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination — mobile-friendly touch targets */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => setFilter('page', filters.page - 1)}
            className="h-10 w-10 p-0 rounded-xl"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(data.totalPages, 5) }).map((_, i) => {
              // Smart windowing: show pages around current
              let pageNum: number
              const total = data.totalPages
              const cur = filters.page
              if (total <= 5) {
                pageNum = i + 1
              } else if (cur <= 3) {
                pageNum = i + 1
              } else if (cur >= total - 2) {
                pageNum = total - 4 + i
              } else {
                pageNum = cur - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setFilter('page', pageNum)}
                  className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                    filters.page === pageNum
                      ? 'bg-brand-600 text-white shadow-brand'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!data.hasMore}
            onClick={() => setFilter('page', filters.page + 1)}
            className="h-10 w-10 p-0 rounded-xl"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
