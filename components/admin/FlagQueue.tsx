// components/admin/FlagQueue.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatRelativeTime } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

interface AIFlag {
  id: string
  reason: string
  confidence: number
  status: string
  details?: string | null
  createdAt: string
  gig?: { id: string; title: string; status: string } | null
  user?: { id: string; name: string } | null
}

interface FlagQueueProps {
  flags: AIFlag[]
}

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  NSFW_IMAGE: { label: 'NSFW Image', color: 'text-red-600 bg-red-50 border-red-100' },
  SPAM: { label: 'Spam', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  GIBBERISH: { label: 'Gibberish', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  NO_REAL_TASK: { label: 'No Real Task', color: 'text-amber-600 bg-amber-50 border-amber-100' },
}

function useFlagAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ flagId, action, adminNote }: { flagId: string; action: 'approve' | 'dismiss'; adminNote: string }) => {
      const res = await fetch(`/api/admin/flags/${flagId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-flags'] })
      toast({ title: vars.action === 'approve' ? 'Flag approved' : 'Flag dismissed', variant: 'default' })
    },
    onError: (err: any) => toast({ title: 'Action failed', description: err.message, variant: 'destructive' }),
  })
}

export function FlagQueue({ flags }: FlagQueueProps) {
  const [acting, setActing] = useState<{ flag: AIFlag; action: 'approve' | 'dismiss' } | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const flagAction = useFlagAction()

  const handleAction = async () => {
    if (!acting) return
    await flagAction.mutateAsync({ flagId: acting.flag.id, action: acting.action, adminNote })
    setActing(null)
    setAdminNote('')
  }

  if (!flags.length) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <p className="text-sm font-semibold">No pending AI flags</p>
        <p className="text-xs text-muted-foreground mt-1">Content looks clean</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {flags.map((flag, i) => {
          const reasonConfig = REASON_LABELS[flag.reason] || { label: flag.reason, color: 'text-gray-600 bg-gray-50 border-gray-200' }
          const confidence = Math.round(flag.confidence * 100)

          return (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-border shadow-soft p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Confidence indicator */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <div className="relative h-11 w-11">
                      <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={confidence > 70 ? '#ef4444' : confidence > 40 ? '#f59e0b' : '#22c55e'}
                          strokeWidth="3"
                          strokeDasharray={`${confidence} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {confidence}%
                      </span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">confidence</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${reasonConfig.color}`}>
                        {reasonConfig.label}
                      </span>
                      {flag.status !== 'PENDING' && (
                        <span className="text-xs text-muted-foreground capitalize">{flag.status.toLowerCase()}</span>
                      )}
                    </div>

                    {flag.gig && (
                      <Link
                        href={`/gigs/${flag.gig.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 mt-1.5 text-sm font-medium hover:text-brand-600 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        {flag.gig.title}
                      </Link>
                    )}
                    {flag.user && (
                      <Link href={`/profile/${flag.user.id}`} target="_blank" className="text-sm text-muted-foreground hover:text-brand-600 mt-1 block">
                        User: {flag.user.name}
                      </Link>
                    )}

                    {flag.details && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic leading-relaxed">{flag.details}</p>
                    )}

                    <p className="text-xs text-muted-foreground mt-1.5">{formatRelativeTime(flag.createdAt)}</p>
                  </div>
                </div>

                {flag.status === 'PENDING' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 text-xs"
                      onClick={() => setActing({ flag, action: 'approve' })}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Remove
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setActing({ flag, action: 'dismiss' })}
                    >
                      <XCircle className="h-3 w-3" />
                      Safe
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <Dialog open={!!acting} onOpenChange={() => { setActing(null); setAdminNote('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {acting?.action === 'approve' ? '🚨 Remove Flagged Content' : '✅ Mark as Safe'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label>Admin Note</Label>
            <Textarea
              placeholder={acting?.action === 'approve' ? 'Why is this content being removed?' : 'Why is this content safe?'}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActing(null); setAdminNote('') }}>Cancel</Button>
            <Button
              variant={acting?.action === 'approve' ? 'destructive' : 'default'}
              onClick={handleAction}
              loading={flagAction.isPending}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
