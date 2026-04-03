// app/gigs/my-gigs/page.tsx
'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { MyGigRow } from '@/components/gigs/MyGigRow'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageTransition } from '@/components/ui/PageTransition'
import { useMyGigs } from '@/hooks/useGigs'
import { useFilterStore } from '@/store/filterStore'

const STATUS_GROUPS = {
  active: ['POSTED', 'IN_PROGRESS'],
  past: ['COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED'],
}

export default function MyGigsPage() {
  const { data: gigs, isLoading } = useMyGigs()
  const { resetFilters } = useFilterStore()
  useEffect(() => { resetFilters() }, [])

  const active = gigs?.filter((g: any) => STATUS_GROUPS.active.includes(g.status)) ?? []
  const past = gigs?.filter((g: any) => STATUS_GROUPS.past.includes(g.status)) ?? []

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Gigs</h1>
              <p className="text-muted-foreground text-sm mt-1">Gigs you've posted</p>
            </div>
            <Link href="/gigs/create">
              <Button className="gap-2 shadow-brand shrink-0">
                <Plus className="h-4 w-4" />
                New Gig
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          {!isLoading && gigs && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Posted', value: gigs.length, color: 'text-foreground' },
                { label: 'Active', value: active.length, color: 'text-brand-600' },
                { label: 'Completed', value: gigs.filter((g: any) => g.status === 'COMPLETED').length, color: 'text-emerald-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-border p-4 shadow-soft text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
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
              <TabsTrigger value="past" className="flex-1">
                Past {past.length > 0 && `(${past.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))
              ) : active.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No active gigs"
                  description="Post your first gig and get responses from campus workers within minutes."
                  action={{ label: 'Post a Gig', href: '/gigs/create' }}
                />
              ) : (
                active.map((gig: any, i: number) => (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <MyGigRow gig={gig} />
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3 mt-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))
              ) : past.length === 0 ? (
                <EmptyState
                  icon="🏁"
                  title="No past gigs yet"
                  description="Completed, cancelled, and expired gigs will show up here."
                />
              ) : (
                past.map((gig: any, i: number) => (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <MyGigRow gig={gig} />
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppShell>
  )
}
