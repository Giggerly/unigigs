// components/gigs/MyGigRow.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { GigStatusBadge } from './GigStatusBadge'
import { GigPriceBadge } from './GigPriceBadge'
import { Button } from '@/components/ui/button'
import { useDeleteGig, useUpdateGigStatus } from '@/hooks/useGigs'
import { formatCurrency, formatDate, getDeadlineLabel } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { GIG_CATEGORIES } from '@/lib/constants'

interface MyGigRowProps {
  gig: {
    id: string
    title: string
    category: string
    budget: number
    isNegotiable: boolean
    deadline: string
    status: string
    createdAt: string
    applications?: { id: string; isSelected: boolean }[]
    _count?: { applications: number }
  }
}

export function MyGigRow({ gig }: MyGigRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteGig = useDeleteGig()
  const updateStatus = useUpdateGigStatus(gig.id)
  const categoryConfig = GIG_CATEGORIES.find((c) => c.value === gig.category)

  const handleDelete = async () => {
    await deleteGig.mutateAsync(gig.id)
    setDeleteOpen(false)
  }

  const handleMarkComplete = async () => {
    await updateStatus.mutateAsync('COMPLETED')
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-border shadow-soft p-4 hover:shadow-card transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Category emoji */}
          <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
            {categoryConfig?.emoji}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/gigs/${gig.id}`}
                className="font-semibold text-foreground hover:text-brand-600 transition-colors leading-snug line-clamp-1"
              >
                {gig.title}
              </Link>
              <GigStatusBadge status={gig.status as any} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <GigPriceBadge budget={gig.budget} isNegotiable={gig.isNegotiable} size="sm" />

              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {getDeadlineLabel(gig.deadline)}
              </span>

              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {gig._count?.applications ?? 0} applied
              </span>

              <span className="text-xs text-muted-foreground">
                Posted {formatDate(gig.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Link href={`/gigs/${gig.id}`}>
            <Button variant="outline" size="sm">View</Button>
          </Link>

          {gig.status === 'POSTED' && (
            <Link href={`/gigs/${gig.id}/edit`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          )}

          {gig.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              variant="subtle"
              className="gap-1.5"
              loading={updateStatus.isPending}
              onClick={handleMarkComplete}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Mark Complete
            </Button>
          )}

          {(gig.status === 'POSTED' || gig.status === 'EXPIRED') && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive ml-auto"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this gig?</DialogTitle>
            <DialogDescription>
              This will permanently remove "{gig.title}" and all its applications. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleteGig.isPending}
            >
              Delete Gig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
