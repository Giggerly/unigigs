// components/gigs/RateWorkerModal.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface RateWorkerModalProps {
  open: boolean
  onClose: () => void
  gigId: string
  workerId: string
  workerName: string
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']

export function RateWorkerModal({ open, onClose, gigId, workerId, workerName }: RateWorkerModalProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, revieweeId: workerId, rating, comment }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit review')
      setSubmitted(true)
    } catch (err: any) {
      toast({ title: 'Failed to submit', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    setRating(0)
    setComment('')
    onClose()
  }

  const displayRating = hovered || rating

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-4 gap-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold">Review submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Your feedback for {workerName} has been recorded. Thank you!
            </p>
            <Button onClick={handleClose} className="w-full mt-2">Done</Button>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
                Rate {workerName}
              </DialogTitle>
              <DialogDescription>
                How was your experience working with them on this gig?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Star rating */}
              <div className="space-y-3">
                <Label>Rating <span className="text-destructive">*</span></Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={cn(
                          'h-9 w-9 transition-colors',
                          star <= displayRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    </button>
                  ))}
                </div>
                {displayRating > 0 && (
                  <motion.p
                    key={displayRating}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-semibold text-amber-600"
                  >
                    {RATING_LABELS[displayRating]}
                  </motion.p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <Label>
                  Comment{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  placeholder={`Share your experience with ${workerName}...`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Skip
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={rating === 0}
                loading={loading}
                className="gap-2"
              >
                <Star className="h-4 w-4 fill-current" />
                Submit Review
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
