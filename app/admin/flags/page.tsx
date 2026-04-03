// app/admin/flags/page.tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import { PageTransition } from '@/components/ui/PageTransition'
import { FlagQueue } from '@/components/admin/FlagQueue'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function useAdminFlags(status: string) {
  return useQuery({
    queryKey: ['admin-flags', status],
    queryFn: async () => {
      const res = await fetch(`/api/admin/flags?status=${status}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })
}

export default function AdminFlagsPage() {
  const pending = useAdminFlags('PENDING')
  const approved = useAdminFlags('APPROVED')
  const rejected = useAdminFlags('REJECTED')

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Flags</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Content flagged by the AI moderation layer — review and decide
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800 leading-relaxed">
          <strong>Moderation policy:</strong> All flags require human review before any action is taken. No content is auto-removed. Flags are for awareness only.
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending {pending.data?.total > 0 && `(${pending.data.total})`}
            </TabsTrigger>
            <TabsTrigger value="approved">Actioned</TabsTrigger>
            <TabsTrigger value="rejected">Cleared</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            {pending.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl mb-3" />)
              : <FlagQueue flags={pending.data?.flags || []} />}
          </TabsContent>
          <TabsContent value="approved" className="mt-4">
            {approved.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl mb-3" />)
              : <FlagQueue flags={approved.data?.flags || []} />}
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
            {rejected.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl mb-3" />)
              : <FlagQueue flags={rejected.data?.flags || []} />}
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
