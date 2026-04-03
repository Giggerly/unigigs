// app/gigs/[id]/edit/page.tsx
'use client'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CreateGigForm } from '@/components/gigs/CreateGigForm'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/PageTransition'
import { Skeleton } from '@/components/ui/skeleton'
import { useGig, useUpdateGig } from '@/hooks/useGigs'
import { useAuth } from '@/hooks/useAuth'

export default function EditGigPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { data: gig, isLoading } = useGig(id)
  const updateGig = useUpdateGig(id)

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AppShell>
    )
  }

  if (!gig || gig.posterId !== user?.id) {
    return (
      <AppShell>
        <div className="flex flex-col items-center py-20">
          <p className="text-lg font-semibold mb-2">Not authorised</p>
          <Button onClick={() => router.push('/gigs/my-gigs')}>My Gigs</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Edit Gig</h1>
              <p className="text-sm text-muted-foreground line-clamp-1">{gig.title}</p>
            </div>
          </div>

          <CreateGigForm
            editData={{
              title: gig.title,
              description: gig.description,
              category: gig.category,
              budget: gig.budget,
              isNegotiable: gig.isNegotiable,
              deadline: new Date(gig.deadline).toISOString().slice(0, 16),
              isUrgent: gig.isUrgent,
              locationMode: gig.locationMode,
              contactPref: gig.contactPref,
              workerCount: gig.workerCount,
              isRepeat: gig.isRepeat,
              tags: gig.tags,
            }}
            gigId={id}
            onSuccess={(updated) => router.push(`/gigs/${id}`)}
          />
        </div>
      </PageTransition>
    </AppShell>
  )
}
