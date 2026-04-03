// app/admin/analytics/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FileText, Users, CheckCircle, AlertTriangle,
  TrendingUp, BarChart3, Star, DollarSign,
} from 'lucide-react'
import { PageTransition } from '@/components/ui/PageTransition'
import { AnalyticsCard } from '@/components/admin/AnalyticsCard'
import { Skeleton } from '@/components/ui/skeleton'
import { GIG_CATEGORIES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

function useAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}

function BarChart({ data, maxVal, color }: { data: number[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((val, i) => {
        const h = maxVal > 0 ? (val / maxVal) * 100 : 0
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className={`w-full rounded-t-md ${color}`}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              style={{ minHeight: val > 0 ? '4px' : '0' }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAnalytics()
  const overview = data?.overview
  const charts = data?.charts

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl space-y-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Marketplace performance and health metrics</p>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnalyticsCard title="Total Gigs" value={overview?.totalGigs ?? 0}
              subtitle={`${overview?.activeGigs ?? 0} open now`}
              icon={FileText} iconColor="text-brand-600" iconBg="bg-brand-50" />
            <AnalyticsCard title="Completion Rate" value={`${overview?.completionRate ?? 0}%`}
              subtitle={`${overview?.completedGigs ?? 0} completed`}
              icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
            <AnalyticsCard title="Total Users" value={overview?.totalUsers ?? 0}
              subtitle={`${overview?.activeUsers ?? 0} joined this month`}
              icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
            <AnalyticsCard title="Pending Reports" value={overview?.pendingReports ?? 0}
              subtitle={`${overview?.totalReports ?? 0} total`}
              icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50"
              alert={(overview?.pendingReports ?? 0) > 5} />
            <AnalyticsCard title="AI Flags" value={overview?.pendingFlags ?? 0}
              subtitle="Awaiting review"
              icon={BarChart3} iconColor="text-purple-600" iconBg="bg-purple-50" />
            <AnalyticsCard title="Active Gigs" value={overview?.activeGigs ?? 0}
              subtitle="Open for applications"
              icon={TrendingUp} iconColor="text-teal-600" iconBg="bg-teal-50" />
          </motion.div>
        )}

        {!isLoading && charts && (
          <div className="space-y-5">
            {/* Daily activity */}
            <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
              <h3 className="text-sm font-bold mb-1">Daily Gig Activity — Last 7 Days</h3>
              <p className="text-xs text-muted-foreground mb-4">New gigs posted per day</p>
              <div className="flex items-end gap-2">
                {charts.dailyActivity?.map((day: any, i: number) => {
                  const max = Math.max(...charts.dailyActivity.map((d: any) => d.count), 1)
                  const h = (day.count / max) * 100
                  const label = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                      {day.count > 0 && (
                        <span className="text-xs font-bold text-brand-600">{day.count}</span>
                      )}
                      <div className="w-full rounded-xl bg-muted overflow-hidden" style={{ height: '80px' }}>
                        <motion.div
                          className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-xl"
                          initial={{ height: '0%' }}
                          animate={{ height: `${h}%` }}
                          style={{ marginTop: `${100 - h}%` }}
                          transition={{ duration: 0.7, delay: i * 0.06 }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Category breakdown */}
              <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
                <h3 className="text-sm font-bold mb-1">Gigs by Category</h3>
                <p className="text-xs text-muted-foreground mb-4">Distribution across categories</p>
                <div className="space-y-3.5">
                  {charts.categoryBreakdown?.map((cat: any) => {
                    const config = GIG_CATEGORIES.find((c) => c.value === cat.category)
                    const max = Math.max(...charts.categoryBreakdown.map((c: any) => c.count), 1)
                    const pct = (cat.count / max) * 100
                    const totalAll = charts.categoryBreakdown.reduce((s: number, c: any) => s + c.count, 0)
                    const share = totalAll > 0 ? Math.round((cat.count / totalAll) * 100) : 0
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium flex items-center gap-1.5">
                            <span>{config?.emoji}</span>
                            {config?.label || cat.category}
                          </span>
                          <span className="text-xs font-bold text-brand-600">
                            {cat.count} <span className="text-muted-foreground font-normal">({share}%)</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-brand-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Avg price by category */}
              <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
                <h3 className="text-sm font-bold mb-1">Avg Budget by Category</h3>
                <p className="text-xs text-muted-foreground mb-4">Average posted budget per category</p>
                <div className="space-y-3.5">
                  {charts.avgPriceByCategory
                    ?.filter((c: any) => c.avgPrice > 0)
                    .sort((a: any, b: any) => b.avgPrice - a.avgPrice)
                    .map((cat: any) => {
                      const config = GIG_CATEGORIES.find((c) => c.value === cat.category)
                      const max = Math.max(...charts.avgPriceByCategory.map((c: any) => c.avgPrice), 1)
                      const pct = (cat.avgPrice / max) * 100
                      return (
                        <div key={cat.category} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium flex items-center gap-1.5">
                              <span>{config?.emoji}</span>
                              {config?.label || cat.category}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                              {formatCurrency(cat.avgPrice)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-emerald-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Rating distribution */}
              <div className="bg-white rounded-2xl border border-border shadow-soft p-6 lg:col-span-2">
                <h3 className="text-sm font-bold mb-1">Rating Distribution</h3>
                <p className="text-xs text-muted-foreground mb-4">All platform reviews by star rating</p>
                <div className="flex items-end gap-6">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const found = charts.ratingDistribution?.find((r: any) => r.rating === star)
                    const count = found?.count || 0
                    const total = charts.ratingDistribution?.reduce((s: number, r: any) => s + r.count, 0) || 1
                    const pct = (count / total) * 100
                    return (
                      <div key={star} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-sm font-bold">{count}</span>
                        <div className="w-full rounded-xl bg-muted overflow-hidden" style={{ height: '64px' }}>
                          <motion.div
                            className="w-full bg-amber-400 rounded-xl"
                            initial={{ height: '0%' }}
                            animate={{ height: `${pct}%` }}
                            style={{ marginTop: `${100 - pct}%` }}
                            transition={{ duration: 0.7, delay: (5 - star) * 0.08 }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-amber-500">{star}★</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
