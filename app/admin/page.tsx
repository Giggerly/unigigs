// app/admin/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FileText, Users, CheckCircle, AlertTriangle,
  Flag, TrendingUp, Clock, BarChart3,
} from 'lucide-react'
import { AnalyticsCard } from '@/components/admin/AnalyticsCard'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTransition } from '@/components/ui/PageTransition'
import { GIG_CATEGORIES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Failed to load analytics')
      return res.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useAdminAnalytics()
  const overview = data?.overview
  const charts = data?.charts

  return (
    <PageTransition>
      <div className="p-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">CampusGig marketplace overview</p>
        </div>

        {/* KPI Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <AnalyticsCard
              title="Total Gigs"
              value={overview?.totalGigs ?? 0}
              subtitle={`${overview?.activeGigs ?? 0} currently active`}
              icon={FileText}
              iconColor="text-brand-600"
              iconBg="bg-brand-50"
            />
            <AnalyticsCard
              title="Completion Rate"
              value={`${overview?.completionRate ?? 0}%`}
              subtitle={`${overview?.completedGigs ?? 0} completed gigs`}
              icon={CheckCircle}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <AnalyticsCard
              title="Total Users"
              value={overview?.totalUsers ?? 0}
              subtitle={`${overview?.activeUsers ?? 0} joined last 30d`}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />
            <AnalyticsCard
              title="Pending Reports"
              value={overview?.pendingReports ?? 0}
              subtitle={`${overview?.totalReports ?? 0} total reports`}
              icon={AlertTriangle}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
              alert={(overview?.pendingReports ?? 0) > 5}
            />
            <AnalyticsCard
              title="AI Flags"
              value={overview?.pendingFlags ?? 0}
              subtitle="Pending review"
              icon={Flag}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
              alert={(overview?.pendingFlags ?? 0) > 10}
            />
            <AnalyticsCard
              title="Active Gigs"
              value={overview?.activeGigs ?? 0}
              subtitle="Open for applications"
              icon={Clock}
              iconColor="text-teal-600"
              iconBg="bg-teal-50"
            />
          </motion.div>
        )}

        {/* Charts row */}
        {!isLoading && charts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category breakdown */}
            <div className="bg-white rounded-2xl border border-border shadow-soft p-5">
              <h3 className="text-sm font-bold mb-4">Gigs by Category</h3>
              <div className="space-y-3">
                {charts.categoryBreakdown?.map((cat: any) => {
                  const config = GIG_CATEGORIES.find((c) => c.value === cat.category)
                  const max = Math.max(...charts.categoryBreakdown.map((c: any) => c.count))
                  const pct = max > 0 ? (cat.count / max) * 100 : 0
                  return (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="text-lg w-6 shrink-0">{config?.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{config?.label || cat.category}</span>
                          <span className="text-xs font-bold text-brand-600">{cat.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-brand-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rating distribution */}
            <div className="bg-white rounded-2xl border border-border shadow-soft p-5">
              <h3 className="text-sm font-bold mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const found = charts.ratingDistribution?.find((r: any) => r.rating === star)
                  const count = found?.count || 0
                  const total = charts.ratingDistribution?.reduce((s: number, r: any) => s + r.count, 0) || 1
                  const pct = (count / total) * 100
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-12 text-right">{star} ★</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-amber-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Daily gig activity */}
            <div className="bg-white rounded-2xl border border-border shadow-soft p-5 lg:col-span-2">
              <h3 className="text-sm font-bold mb-4">Gig Activity — Last 7 Days</h3>
              <div className="flex items-end gap-2 h-24">
                {charts.dailyActivity?.map((day: any) => {
                  const max = Math.max(...charts.dailyActivity.map((d: any) => d.count), 1)
                  const height = max > 0 ? (day.count / max) * 100 : 0
                  const label = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-brand-600">{day.count > 0 ? day.count : ''}</span>
                      <div className="w-full rounded-t-lg bg-muted overflow-hidden" style={{ height: '64px' }}>
                        <motion.div
                          className="w-full rounded-t-lg bg-brand-500"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          style={{ marginTop: 'auto' }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
