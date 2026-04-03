// components/admin/ReportQueue.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ExternalLink, Flag } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { REPORT_REASONS } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

interface Report {
  id: string
  reason: string
  description?: string | null
  status: string
  targetType: string
  createdAt: string
  reporter: { id: string; name: string; profileImage?: string | null }
  reportedUser?: { id: string; name: string; profileImage?: string | null } | null
  gig?: { id: string; title: string } | null
}

interface ReportQueueProps {
  reports: Report[]
}

function useResolveReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ reportId, status, adminNote }: { reportId: string; status: string; adminNote: string }) => {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast({ title: 'Report resolved', variant: 'default' })
    },
    onError: (err: any) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  })
}

const REASON_LABEL: Record<string, string> = Object.fromEntries(
  REPORT_REASONS.map((r) => [r.value, r.label])
)

export function ReportQueue({ reports }: ReportQueueProps) {
  const [resolving, setResolving] = useState<{ report: Report; action: 'RESOLVED' | 'DISMISSED' } | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const resolveMutation = useResolveReport()

  const handleResolve = async () => {
    if (!resolving) return
    await resolveMutation.mutateAsync({
      reportId: resolving.report.id,
      status: resolving.action,
      adminNote,
    })
    setResolving(null)
    setAdminNote('')
  }

  if (!reports.length) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <p className="text-sm font-semibold">All clear!</p>
        <p className="text-xs text-muted-foreground mt-1">No pending reports</p>
      </div>
    )
  }

  const STATUS_COLOR: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    REVIEWED: 'bg-blue-50 text-blue-700 border-blue-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    DISMISSED: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  return (
    <>
      <div className="space-y-3">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl border border-border shadow-soft p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <Flag className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold">
                      {REASON_LABEL[report.reason] || report.reason}
                    </span>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[report.status] || ''}`}>
                      {report.status}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {report.targetType.toLowerCase()}
                    </span>
                  </div>

                  {report.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      "{report.description}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    {/* Reporter */}
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={report.reporter.profileImage || ''} />
                        <AvatarFallback name={report.reporter.name} className="text-[8px]" />
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        By <span className="font-medium text-foreground">{report.reporter.name}</span>
                      </span>
                    </div>

                    {/* Reported user */}
                    {report.reportedUser && (
                      <span className="text-xs text-muted-foreground">
                        Against <Link href={`/profile/${report.reportedUser.id}`} target="_blank" className="font-medium text-foreground hover:text-brand-600">{report.reportedUser.name}</Link>
                      </span>
                    )}

                    {/* Gig */}
                    {report.gig && (
                      <Link href={`/gigs/${report.gig.id}`} target="_blank" className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
                        <ExternalLink className="h-3 w-3" />
                        {report.gig.title.slice(0, 40)}...
                      </Link>
                    )}

                    <span className="text-xs text-muted-foreground">{formatRelativeTime(report.createdAt)}</span>
                  </div>
                </div>
              </div>

              {report.status === 'PENDING' && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setResolving({ report, action: 'RESOLVED' })}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Resolve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setResolving({ report, action: 'DISMISSED' })}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!resolving} onOpenChange={() => { setResolving(null); setAdminNote('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolving?.action === 'RESOLVED' ? '✅ Resolve Report' : '❌ Dismiss Report'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label>Admin Note</Label>
            <Textarea
              placeholder="Describe what action was taken or why this was dismissed..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResolving(null); setAdminNote('') }}>Cancel</Button>
            <Button
              onClick={handleResolve}
              loading={resolveMutation.isPending}
              className={resolving?.action === 'DISMISSED' ? 'bg-gray-600 hover:bg-gray-700' : ''}
            >
              Confirm {resolving?.action === 'RESOLVED' ? 'Resolution' : 'Dismissal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
