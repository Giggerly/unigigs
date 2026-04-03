// app/gigs/[id]/page.tsx
'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Clock, MapPin, Users, Eye, Calendar, Flag,
  MessageSquare, CheckCircle, Share2, Zap, RotateCcw, Edit,
  AlertTriangle, Star,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { GigStatusBadge } from '@/components/gigs/GigStatusBadge'
import { GigPriceBadge } from '@/components/gigs/GigPriceBadge'
import { GigAttachments } from '@/components/gigs/GigAttachments'
import { ApplicantList } from '@/components/gigs/ApplicantList'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTransition } from '@/components/ui/PageTransition'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGig, useApplyToGig, useUpdateGigStatus } from '@/hooks/useGigs'
import { useAuth } from '@/hooks/useAuth'
import { GIG_CATEGORIES, LOCATION_MODES } from '@/lib/constants'
import {
  formatDate, formatCurrency, getDeadlineLabel,
  isUrgentDeadline, formatRelativeTime,
} from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { RateWorkerModal } from '@/components/gigs/RateWorkerModal'

export default function GigDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { data: gig, isLoading, error } = useGig(id)

  // Modal state
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [applyPrice, setApplyPrice] = useState('')
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false)
  // "rate worker" modal — opened for the poster after marking complete
  const [rateWorkerOpen, setRateWorkerOpen] = useState(false)
  // "rate poster" modal — opened for the worker on a completed gig
  const [ratePosterOpen, setRatePosterOpen] = useState(false)

  const applyMutation = useApplyToGig(id)
  const updateStatus = useUpdateGigStatus(id)

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </AppShell>
    )
  }

  if (error || !gig) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-lg font-bold mb-1">Gig not found</h2>
          <p className="text-muted-foreground text-sm mb-6">This gig may have been removed.</p>
          <Button onClick={() => router.push('/gigs')}>Browse Gigs</Button>
        </div>
      </AppShell>
    )
  }

  const categoryConfig = GIG_CATEGORIES.find((c) => c.value === gig.category)
  const locationConfig = LOCATION_MODES.find((l) => l.value === gig.locationMode)
  const isOwner = user?.id === gig.posterId
  const isWorker = user?.id === gig.workerId
  const isParticipant = isOwner || isWorker
  const deadlineLabel = getDeadlineLabel(gig.deadline)
  const urgentDeadline = isUrgentDeadline(gig.deadline)

  // Check if this user already left a review for this gig
  const alreadyReviewed = gig.reviews?.some(
    (r: any) => r.reviewerId === user?.id
  )

  const handleApply = async () => {
    await applyMutation.mutateAsync({
      message: applyMessage || undefined,
      proposedPrice: applyPrice ? parseFloat(applyPrice) : undefined,
    })
    setApplyOpen(false)
  }

  // Called when poster confirms "Mark as Completed"
  const handleConfirmComplete = async () => {
    setConfirmCompleteOpen(false)
    try {
      await updateStatus.mutateAsync('COMPLETED')
      toast({ title: 'Gig marked as completed! 🎉' })
      // Open rate-worker modal for the poster
      setRateWorkerOpen(true)
    } catch {
      // error is handled inside the mutation
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: gig.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied!', variant: 'default' })
    }
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Back + actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              {!isOwner && (
                <Link href={`/report?gigId=${id}&userId=${gig.posterId}`}>
                  <Button variant="ghost" size="icon-sm">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>
              )}
              {isOwner && gig.status === 'POSTED' && (
                <Link href={`/gigs/${id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-white shadow-card overflow-hidden"
          >
            {/* Urgent top bar */}
            {(gig.isUrgent || urgentDeadline) && (
              <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400" />
            )}
            {/* Completed top bar */}
            {gig.status === 'COMPLETED' && (
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            )}

            <div className="p-6 space-y-5">
              {/* Category + status row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${categoryConfig?.color}`}>
                    <span className="text-base">{categoryConfig?.emoji}</span>
                    {categoryConfig?.label}
                  </span>
                  <GigStatusBadge status={gig.status} />
                </div>
                {(gig.isUrgent || urgentDeadline) && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Urgent
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold leading-snug">{gig.title}</h1>

              {/* Price */}
              <GigPriceBadge budget={gig.budget} isNegotiable={gig.isNegotiable} size="lg" />

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock, label: 'Deadline', value: deadlineLabel, urgent: urgentDeadline },
                  { icon: Calendar, label: 'Posted', value: formatRelativeTime(gig.createdAt) },
                  { icon: MapPin, label: 'Location', value: locationConfig?.label || gig.locationMode },
                  { icon: Eye, label: 'Views', value: `${gig.viewCount} views` },
                  { icon: Users, label: 'Applied', value: `${gig._count?.applications || 0} workers` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                    <item.icon className={`h-4 w-4 shrink-0 ${item.urgent ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{item.label}</p>
                      <p className={`text-sm font-semibold ${item.urgent ? 'text-red-600' : ''}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{gig.description}</p>
              </div>

              {/* Attachments */}
              {gig.attachments?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attachments</h3>
                  <GigAttachments attachments={gig.attachments} />
                </div>
              )}

              {/* Tags */}
              {gig.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center text-xs font-medium bg-muted rounded-full px-3 py-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Worker card (shown when gig is IN_PROGRESS or COMPLETED) */}
          {gig.worker && (gig.status === 'IN_PROGRESS' || gig.status === 'COMPLETED') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {gig.status === 'COMPLETED' ? 'Completed by' : 'Working on this'}
              </h3>
              <ProfileCard user={gig.worker} />
            </motion.div>
          )}

          {/* Poster card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Posted by</h3>
            <ProfileCard user={gig.poster} />
          </motion.div>

          {/* ── CTA SECTION ── */}

          {/* Non-owner: Apply CTA */}
          {!isOwner && gig.status === 'POSTED' && user && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              {gig.hasApplied ? (
                <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700">You've applied to this gig</p>
                </div>
              ) : (
                <Button
                  size="xl"
                  className="w-full gap-2 shadow-brand"
                  onClick={() => setApplyOpen(true)}
                >
                  <MessageSquare className="h-5 w-5" />
                  Apply / Express Interest
                </Button>
              )}
            </motion.div>
          )}

          {/* Owner: Mark Completed + Raise Dispute */}
          {isOwner && gig.status === 'IN_PROGRESS' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="flex gap-3"
            >
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={() => setConfirmCompleteOpen(true)}
              >
                <CheckCircle className="h-5 w-5" />
                Mark as Completed
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                onClick={() => updateStatus.mutateAsync('DISPUTED')}
              >
                Raise Dispute
              </Button>
            </motion.div>
          )}

          {/* Owner: Already completed — prompt to leave review if not done */}
          {isOwner && gig.status === 'COMPLETED' && gig.workerId && !alreadyReviewed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <button
                onClick={() => setRateWorkerOpen(true)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-800">Leave a Review</p>
                  <p className="text-xs text-amber-600">Rate {gig.worker?.name || 'the worker'} for their work on this gig</p>
                </div>
              </button>
            </motion.div>
          )}

          {/* Owner: reviewed — show confirmation */}
          {isOwner && gig.status === 'COMPLETED' && alreadyReviewed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Review submitted</p>
                  <p className="text-xs text-emerald-600">You've already rated the worker for this gig.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Worker: prompt to rate poster after completion */}
          {isWorker && gig.status === 'COMPLETED' && !alreadyReviewed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <button
                onClick={() => setRatePosterOpen(true)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-800">Rate this Gig Poster</p>
                  <p className="text-xs text-amber-600">How was your experience working with {gig.poster?.name}?</p>
                </div>
              </button>
            </motion.div>
          )}

          {/* Worker: already reviewed */}
          {isWorker && gig.status === 'COMPLETED' && alreadyReviewed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Review submitted</p>
                  <p className="text-xs text-emerald-600">You've already rated the poster for this gig.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Applicants / Activity tabs (owner only) */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <Tabs defaultValue="applicants">
                <TabsList className="w-full">
                  <TabsTrigger value="applicants" className="flex-1">
                    Applicants ({gig.applications?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1">
                    Messages
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="applicants" className="mt-4">
                  <ApplicantList
                    gigId={id}
                    applicants={gig.applications || []}
                    gigStatus={gig.status}
                    isOwner={isOwner}
                    selectedWorkerId={gig.workerId}
                  />
                </TabsContent>
                <TabsContent value="chat" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">Manage all conversations for this gig</p>
                    <Link href={`/messages?gigId=${id}`}>
                      <Button variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Open Messages
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

        </div>
      </PageTransition>

      {/* ── Apply modal ── */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for this gig</DialogTitle>
            <DialogDescription>
              Send a message to the poster. You can also propose your own price.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Message (optional)</Label>
              <Textarea
                placeholder="Introduce yourself, describe your approach, or ask any questions..."
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            {gig.isNegotiable && (
              <div className="space-y-1.5">
                <Label>Proposed Price (optional)</Label>
                <Input
                  type="number"
                  placeholder={`Poster's budget: ${formatCurrency(gig.budget)}`}
                  value={applyPrice}
                  onChange={(e) => setApplyPrice(e.target.value)}
                  leftIcon={<span className="text-sm font-medium">₹</span>}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} loading={applyMutation.isPending} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Send Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Complete dialog ── */}
      <Dialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              Mark as Completed?
            </DialogTitle>
            <DialogDescription>
              Confirm that <strong>{gig.worker?.name || 'the worker'}</strong> has finished the work. 
              This will mark the gig as <strong>COMPLETED</strong> and you'll be asked to leave a review.
              This action <strong>cannot be undone</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCompleteOpen(false)}>
              Not yet
            </Button>
            <Button
              onClick={handleConfirmComplete}
              loading={updateStatus.isPending}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Yes, Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rate Worker Modal (for the POSTER after completion) ── */}
      {gig?.workerId && (
        <RateWorkerModal
          open={rateWorkerOpen}
          onClose={() => setRateWorkerOpen(false)}
          gigId={gig.id}
          workerId={gig.workerId}
          workerName={gig.worker?.name || 'the worker'}
        />
      )}

      {/* ── Rate Poster Modal (for the WORKER after completion) ── */}
      {gig?.posterId && (
        <RateWorkerModal
          open={ratePosterOpen}
          onClose={() => setRatePosterOpen(false)}
          gigId={gig.id}
          workerId={gig.posterId}
          workerName={gig.poster?.name || 'the poster'}
        />
      )}
    </AppShell>
  )
}
