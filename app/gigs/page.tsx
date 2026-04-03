// app/gigs/page.tsx
'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { GigFeed } from '@/components/gigs/GigFeed'
import { GigSearchBar } from '@/components/gigs/GigSearchBar'
import { GigSortSelect } from '@/components/gigs/GigSortSelect'
import { GigFilters } from '@/components/gigs/GigFilters'
import { CategoryChips } from '@/components/gigs/CategoryChips'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useAuth } from '@/hooks/useAuth'
import { useFilterStore } from '@/store/filterStore'

export default function GigsPage() {
  const { user } = useAuth()
  const { resetFilters } = useFilterStore()

  useEffect(() => { resetFilters() }, [])

  const firstName = user?.name?.split(' ')[0]

  return (
    <AppShell>
      <PageTransition>
        <div className="space-y-4 overflow-x-hidden">

          {/* ── Hero header ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 pt-1"
          >
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight truncate">
                {firstName ? (
                  <>Hey, <span className="text-brand-600">{firstName}</span> 👋</>
                ) : (
                  <>Campus Gigs <span className="text-brand-600">Near You</span> 🎓</>
                )}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 leading-snug">
                Find work or post a gig — fast campus economy.
              </p>
            </div>

            {/* Post gig — visible on all screen sizes on mobile via icon only */}
            <Link href="/gigs/create" className="shrink-0">
              <Button size="sm" className="gap-1.5 shadow-brand h-9 px-3 sm:px-4">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Post Gig</span>
                <span className="sm:hidden text-xs font-semibold">Post</span>
              </Button>
            </Link>
          </motion.div>

          {/* ── Search bar ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
          >
            <GigSearchBar />
          </motion.div>

          {/* ── Category chips ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CategoryChips />
          </motion.div>

          {/* ── Filter + sort row ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="flex items-center gap-2"
          >
            <GigFilters />
            <div className="ml-auto shrink-0">
              <GigSortSelect />
            </div>
          </motion.div>

          {/* ── Feed ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
          >
            <GigFeed />
          </motion.div>

        </div>
      </PageTransition>
    </AppShell>
  )
}
