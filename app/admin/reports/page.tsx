// app/admin/reports/page.tsx
'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageTransition } from '@/components/ui/PageTransition'
import { ReportQueue } from '@/components/admin/ReportQueue'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function useAdminReports(status?: string) {
  return useQuery({
    queryKey: ['admin-reports', status],
    queryFn: async () => {
      const qs = status ? `?status=${status}` : ''
      const res = await fetch(`/api/admin/reports${qs}`)
      if (!res.ok) throw new Error('Failed to load reports')
      return res.json()
    },
  })
}

export default function AdminReportsPage() {
  const pending = useAdminReports('PENDING')
  const resolved = useAdminReports('RESOLVED')
  const dismissed = useAdminReports('DISMISSED')

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">User-submitted reports for review</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending {pending.data?.total > 0 && `(${pending.data.total})`}
            </TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {pending.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl mb-3" />)
              : <ReportQueue reports={pending.data?.reports || []} />}
          </TabsContent>
          <TabsContent value="resolved" className="mt-4">
            {resolved.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl mb-3" />)
              : <ReportQueue reports={resolved.data?.reports || []} />}
          </TabsContent>
          <TabsContent value="dismissed" className="mt-4">
            {dismissed.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl mb-3" />)
              : <ReportQueue reports={dismissed.data?.reports || []} />}
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
