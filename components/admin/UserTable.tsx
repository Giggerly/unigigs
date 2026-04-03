// components/admin/UserTable.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, Ban, CheckCircle, ExternalLink, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RatingStars } from '@/components/profile/RatingStars'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  WARNED: 'bg-amber-50 text-amber-700 border-amber-100',
  SUSPENDED: 'bg-red-50 text-red-600 border-red-100',
  BANNED: 'bg-gray-100 text-gray-500 border-gray-200',
}

interface User {
  id: string
  name: string
  phone: string
  email?: string | null
  status: string
  college?: string | null
  profileImage?: string | null
  avgRating: number
  completedGigs: number
  createdAt: string
  _count: { postedGigs: number; reportedBy: number }
}

interface UserTableProps {
  users: User[]
}

function useAdminUserAction(action: 'warn' | 'suspend') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: action === 'warn' ? 'User warned' : 'User suspended', variant: 'default' })
    },
    onError: (err: any) => toast({ title: 'Action failed', description: err.message, variant: 'destructive' }),
  })
}

export function UserTable({ users }: UserTableProps) {
  const [actionUser, setActionUser] = useState<{ user: User; type: 'warn' | 'suspend' } | null>(null)
  const [note, setNote] = useState('')
  const warnMutation = useAdminUserAction('warn')
  const suspendMutation = useAdminUserAction('suspend')

  const handleAction = async () => {
    if (!actionUser) return
    const mutation = actionUser.type === 'warn' ? warnMutation : suspendMutation
    await mutation.mutateAsync({ userId: actionUser.user.id, note })
    setActionUser(null)
    setNote('')
  }

  if (!users.length) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-soft hover:shadow-card transition-all"
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.profileImage || ''} alt={user.name} />
              <AvatarFallback name={user.name} className="text-sm" />
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profile/${user.id}`} target="_blank">
                  <span className="text-sm font-semibold hover:text-brand-600 transition-colors">
                    {user.name}
                  </span>
                </Link>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[user.status] || ''}`}>
                  {user.status}
                </span>
                {user._count.reportedBy > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    {user._count.reportedBy} report{user._count.reportedBy !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <span className="text-xs text-muted-foreground">{user.phone}</span>
                {user.college && <span className="text-xs text-muted-foreground">{user.college}</span>}
                <RatingStars rating={user.avgRating} size="sm" showValue />
                <span className="text-xs text-muted-foreground">{user.completedGigs} completed</span>
                <span className="text-xs text-muted-foreground">{user._count.postedGigs} posted</span>
                <span className="text-xs text-muted-foreground">Joined {formatRelativeTime(user.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.id}`} target="_blank" className="gap-2 cursor-pointer">
                    <ExternalLink className="h-4 w-4" /> View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.status !== 'WARNED' && user.status !== 'SUSPENDED' && (
                  <DropdownMenuItem
                    className="gap-2 text-amber-600 focus:text-amber-600 cursor-pointer"
                    onClick={() => setActionUser({ user, type: 'warn' })}
                  >
                    <AlertTriangle className="h-4 w-4" /> Warn User
                  </DropdownMenuItem>
                )}
                {user.status !== 'SUSPENDED' && (
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setActionUser({ user, type: 'suspend' })}
                  >
                    <Ban className="h-4 w-4" /> Suspend
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))}
      </div>

      {/* Action confirm dialog */}
      <Dialog open={!!actionUser} onOpenChange={() => { setActionUser(null); setNote('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionUser?.type === 'warn' ? '⚠️ Warn User' : '🚫 Suspend User'}
            </DialogTitle>
            <DialogDescription>
              {actionUser?.type === 'warn'
                ? `Send an official warning to ${actionUser?.user.name}. They will be notified.`
                : `Suspend ${actionUser?.user.name}'s account. They will not be able to log in.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label>Admin Note (internal)</Label>
            <Textarea
              placeholder="Reason for this action..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionUser(null); setNote('') }}>Cancel</Button>
            <Button
              variant={actionUser?.type === 'warn' ? 'default' : 'destructive'}
              onClick={handleAction}
              loading={warnMutation.isPending || suspendMutation.isPending}
            >
              Confirm {actionUser?.type === 'warn' ? 'Warning' : 'Suspension'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
