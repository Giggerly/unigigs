// app/my-work/page.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle, Clock, AlertCircle, XCircle,
  ArrowRight, Briefcase, TrendingUp, Star,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageTransition } from '@/components/ui/PageTransition'
import { GigPriceBadge } from '@/components/gigs/GigPriceBadge'
import { GigStatusBadge } from '@/components/gigs/GigStatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMyWork } from '@/hooks/useGigs'
import { useAuth } from '@/hooks/useAuth'
import { GIG_CATEGORIES } from '@/lib/constants'
import { formatRelativeTime, formatCurrency, getDeadlineLabel } from '@/lib/utils'

function WorkCard({ application, index }: { application: any; index: number }) {
  const { gig } = application
  const categoryConfig = GIG_CATEGORIES.find((c) => c.value === gig.category)

  const statusIcon = {
    POSTED: <Clock className="h-3.5 w-3.5 text-brand-600" />,
    IN_PROGRESS: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
    COMPLETED: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />,
    CANCELLED: <XCircle className="h-3.5 w-3.5 text-muted-foreground" />,
    DISPUTED: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
    EXPIRED: <XCircle className="h-3.5 w-3.5 text-muted-foreground" />,
  }[gig.status as string] || <Clock className="h-3.5 w-3.5" />

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/gigs/${gig.id}`}>
        <div className="bg-white rounded-2xl border border-border shadow-soft p-4 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
          <div className="flex items-start gap-3">
            {/* Category icon */}
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
              {categoryConfig?.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {gig.title}
                </h3>
                <GigStatusBadge status={gig.status} />
              </div>

              {/* Poster info */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={gig.poster?.profileImage || ''} />
                  <AvatarFallback name={gig.poster?.name || 'P'} className="text-[8px]" />
                </Avatar>
                <span className="text-xs text-muted-foreground">by {gig.poster?.name}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{formatRelativeTime(application.createdAt)}</span>
              </div>

              {/* Price + deadline */}
              <div className="flex items-center justify-between mt-2.5">
                <GigPriceBadge
                  budget={application.proposedPrice || gig.budget}
                  isNegotiable={false}
                  size="sm"
                />
                <span className="text-xs text-muted-foreground">{getDeadlineLabel(gig.deadline)}</span>
              </div>

              {/* Application status */}
              {application.isSelected && (
                <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 w-fit">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">You were selected!</span>
                </div>
              )}

              {application.message && (
                <p className="mt-2 text-xs text-muted-foreground italic line-clamp-1">
                  Your note: "{application.message}"
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function MyWorkPage() {
  const { user } = useAuth()
  const { data: applications, isLoading } = useMyWork()

  const active = applications?.filter((a: any) =>
    ['POSTED', 'IN_PROGRESS'].includes(a.gig.status)
  ) ?? []

  const completed = applications?.filter((a: any) =>
    a.gig.status === 'COMPLETED'
  ) ?? []

  const past = applications?.filter((a: any) =>
    ['CANCELLED', 'EXPIRED', 'DISPUTED'].includes(a.gig.status)
  ) ?? []

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Work</h1>
            <p className="text-muted-foreground text-sm mt-1">Gigs you've applied to or completed</p>
          </div>

          {/* Stats */}
          {!isLoading && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Applied', value: applications?.length ?? 0,
                  icon: Briefcase, color: 'text-brand-600', bg: 'bg-brand-50',
                },
                {
                  label: 'Completed', value: user?.completedGigs ?? 0,
                  icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50',
                },
                {
                  label: 'Avg Rating', value: user?.avgRating ? user.avgRating.toFixed(1) : '—',
                  icon: Star, color: 'text-amber-600', bg: 'bg-amber-50',
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-border p-4 shadow-soft">
                  <div className={`h-8 w-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="active">
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">
                Active {active.length > 0 && `(${active.length})`}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Done {completed.length > 0 && `(${completed.length})`}
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Other
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              ) : active.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="No active applications"
                  description="Browse gigs and apply to ones that match your skills."
                  action={{ label: 'Browse Gigs', href: '/gigs' }}
                />
              ) : (
                active.map((a: any, i: number) => <WorkCard key={a.id} application={a} index={i} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              ) : completed.length === 0 ? (
                <EmptyState
                  icon="🏆"
                  title="No completed gigs yet"
                  description="Complete gigs to build your reputation and earn reviews."
                />
              ) : (
                completed.map((a: any, i: number) => <WorkCard key={a.id} application={a} index={i} />)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3 mt-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              ) : past.length === 0 ? (
                <EmptyState
                  icon="📂"
                  title="Nothing here"
                  description="Cancelled, expired, and disputed gigs appear here."
                />
              ) : (
                past.map((a: any, i: number) => <WorkCard key={a.id} application={a} index={i} />)
              )}
            </TabsContent>
          </Tabs>

          {/* Discover more CTA */}
          {!isLoading && (applications?.length ?? 0) === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-6 text-center">
              <p className="text-sm font-semibold text-brand-800 mb-1">Ready to earn?</p>
              <p className="text-xs text-brand-600 mb-4">
                Browse open gigs and start building your campus reputation
              </p>
              <Link href="/gigs">
                <Button className="gap-2">
                  Explore Gigs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </PageTransition>
    </AppShell>
  )
}
