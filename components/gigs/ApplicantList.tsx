// components/gigs/ApplicantList.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/profile/RatingStars'
import { useSelectWorker } from '@/hooks/useGigs'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface Applicant {
  id: string
  message?: string | null
  proposedPrice?: number | null
  isSelected: boolean
  createdAt: string
  user: {
    id: string
    name: string
    profileImage?: string | null
    college?: string | null
    avgRating: number
    ratingCount: number
    completedGigs: number
  }
}

interface ApplicantListProps {
  gigId: string
  applicants: Applicant[]
  gigStatus: string
  isOwner: boolean
  selectedWorkerId?: string | null
}

export function ApplicantList({ gigId, applicants, gigStatus, isOwner, selectedWorkerId }: ApplicantListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const selectWorker = useSelectWorker(gigId)

  if (!applicants.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No applicants yet — share this gig to get responses!</p>
      </div>
    )
  }

  const handleSelect = async () => {
    if (!confirmId) return
    await selectWorker.mutateAsync(confirmId)
    setConfirmId(null)
  }

  return (
    <>
      <div className="space-y-3">
        {applicants.map((applicant, i) => (
          <motion.div
            key={applicant.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-4 bg-white shadow-soft transition-all ${
              applicant.isSelected
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <Link href={`/profile/${applicant.user.id}`}>
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={applicant.user.profileImage || ''} alt={applicant.user.name} />
                  <AvatarFallback name={applicant.user.name} className="text-sm" />
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${applicant.user.id}`}
                        className="text-sm font-semibold hover:text-brand-600 transition-colors"
                      >
                        {applicant.user.name}
                      </Link>
                      {applicant.isSelected && (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <RatingStars rating={applicant.user.avgRating} size="sm" showValue />
                      <span className="text-xs text-muted-foreground">
                        · {applicant.user.completedGigs} completed
                      </span>
                    </div>
                    {applicant.user.college && (
                      <p className="text-xs text-muted-foreground mt-0.5">{applicant.user.college}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    {formatRelativeTime(applicant.createdAt)}
                  </span>
                </div>

                {applicant.message && (
                  <p className="mt-2 text-sm text-foreground/80 leading-relaxed bg-muted/50 rounded-xl p-3">
                    "{applicant.message}"
                  </p>
                )}

                {applicant.proposedPrice && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 border border-brand-100 px-3 py-1.5">
                    <span className="text-xs text-brand-600 font-medium">Proposed:</span>
                    <span className="text-sm font-bold text-brand-700">
                      {formatCurrency(applicant.proposedPrice)}
                    </span>
                  </div>
                )}

                {isOwner && gigStatus === 'POSTED' && !selectedWorkerId && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setConfirmId(applicant.user.id)}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Select
                    </Button>
                    <Link href={`/messages?gigId=${gigId}&userId=${applicant.user.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </Button>
                    </Link>
                    <Link href={`/profile/${applicant.user.id}`} target="_blank">
                      <Button variant="ghost" size="icon-sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select this worker?</DialogTitle>
            <DialogDescription>
              They'll be notified immediately and the gig will move to "In Progress". You can mark it complete after the work is done.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button onClick={handleSelect} loading={selectWorker.isPending}>
              Yes, Select Them
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
