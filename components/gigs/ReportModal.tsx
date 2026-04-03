// components/gigs/ReportModal.tsx
'use client'
import { useState } from 'react'
import { Flag, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { REPORT_REASONS } from '@/lib/constants'
import { useSubmitReport } from '@/hooks/useReviews'
import { cn } from '@/lib/utils'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  targetType: 'GIG' | 'USER' | 'MESSAGE'
  gigId?: string
  reportedUserId?: string
  messageId?: string
  targetName?: string
}

export function ReportModal({
  open,
  onClose,
  targetType,
  gigId,
  reportedUserId,
  messageId,
  targetName,
}: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const submitReport = useSubmitReport()

  const handleSubmit = async () => {
    if (!reason) return
    await submitReport.mutateAsync({
      reason,
      description: description || undefined,
      targetType,
      gigId,
      reportedUserId,
      messageId,
    })
    onClose()
    setReason('')
    setDescription('')
  }

  const targetLabel = {
    GIG: 'gig',
    USER: 'user',
    MESSAGE: 'message',
  }[targetType]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Flag className="h-5 w-5 text-red-500" />
            </div>
            Report {targetLabel}
          </DialogTitle>
          <DialogDescription>
            {targetName && (
              <span className="font-medium text-foreground">"{targetName}"</span>
            )}{' '}
            — Reports are reviewed by our admin team within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={cn(
                    'text-left text-xs font-medium px-3 py-2.5 rounded-xl border transition-all',
                    reason === r.value
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-border hover:border-red-200 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <Label>
              Additional details{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              placeholder="Describe the issue in more detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Warning note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              False reports may result in action against your account. Only report genuine violations.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitReport.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason}
            loading={submitReport.isPending}
            variant="destructive"
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
