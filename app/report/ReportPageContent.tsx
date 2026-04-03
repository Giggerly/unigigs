// app/report/ReportPageContent.tsx
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flag, ChevronLeft, CheckCircle } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { PageTransition } from '@/components/ui/PageTransition'

const REPORT_REASONS = [
  { value: 'SCAM', label: '💸 Scam / Fraud' },
  { value: 'SPAM', label: '📢 Spam' },
  { value: 'HARASSMENT', label: '😡 Harassment' },
  { value: 'INAPPROPRIATE_CONTENT', label: '🚫 Inappropriate Content' },
  { value: 'UNPAID_WORK', label: '💰 Unpaid Work' },
  { value: 'MISLEADING_PRICING', label: '🏷️ Misleading Pricing' },
  { value: 'FAKE_IDENTITY', label: '🎭 Fake Identity' },
  { value: 'PROHIBITED_TASK', label: '⛔ Prohibited Task' },
  { value: 'ABUSE', label: '🤬 Abuse' },
  { value: 'OTHER', label: '❓ Other' },
]

export default function ReportPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gigId = searchParams.get('gigId')
  const userId = searchParams.get('userId')
  const messageId = searchParams.get('messageId')
  const conversationId = searchParams.get('conversationId')

  const [reason, setReason] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const targetType = messageId ? 'MESSAGE' : gigId ? 'GIG' : 'USER'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      toast({ title: 'Please select a reason', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          description: `${title ? `[${title}] ` : ''}${description}`.trim(),
          targetType,
          gigId: gigId || undefined,
          reportedUserId: userId || undefined,
          messageId: messageId || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit report')
      setSubmitted(true)
    } catch (err: any) {
      toast({ title: 'Report failed', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AppShell>
        <PageTransition>
          <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center"
            >
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">Report Submitted</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Our admin team has been notified and will review your report shortly.
                Thank you for helping keep Unigigs safe.
              </p>
            </div>
            <Button
              onClick={() => {
                if (conversationId) router.push(`/messages/${conversationId}`)
                else if (gigId) router.push(`/gigs/${gigId}`)
                else router.back()
              }}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </PageTransition>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center">
                <Flag className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Submit a Report</h1>
                <p className="text-xs text-muted-foreground">Help us keep the platform safe</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Reason */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Title</Label>
              <Input
                placeholder="Brief summary of the issue..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Description</Label>
              <textarea
                placeholder="Describe what happened in detail. The more context you provide, the faster we can resolve this."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={1000}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none outline-none focus:border-brand-300 transition-colors placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
            </div>

            {/* Context chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              {gigId && (
                <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-medium">
                  📋 Reporting a Gig
                </span>
              )}
              {userId && (
                <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-medium">
                  👤 Reporting a User
                </span>
              )}
              {messageId && (
                <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-medium">
                  💬 Reporting a Message
                </span>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
              <strong>Note:</strong> False reports may result in a warning on your account.
              Please only report genuine violations.
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              loading={submitting}
              disabled={!reason || submitting}
            >
              <Flag className="h-4 w-4" />
              Submit Report
            </Button>
          </form>
        </div>
      </PageTransition>
    </AppShell>
  )
}
