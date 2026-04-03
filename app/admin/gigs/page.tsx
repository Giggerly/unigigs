// app/admin/gigs/page.tsx
'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Trash2, ExternalLink, MoreVertical } from 'lucide-react'
import { PageTransition } from '@/components/ui/PageTransition'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { GigStatusBadge } from '@/components/gigs/GigStatusBadge'
import { GigPriceBadge } from '@/components/gigs/GigPriceBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { GIG_CATEGORIES } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'

function useAdminGigs(search: string, status: string) {
  return useQuery({
    queryKey: ['admin-gigs', search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status && status !== 'ALL') params.set('status', status)
      const res = await fetch(`/api/admin/gigs?${params}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    staleTime: 30 * 1000,
  })
}

export default function AdminGigsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [removeTarget, setRemoveTarget] = useState<{ id: string; title: string } | null>(null)
  const debouncedSearch = useDebounce(search, 350)
  const { data, isLoading } = useAdminGigs(debouncedSearch, status)
  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: async (gigId: string) => {
      const res = await fetch(`/api/admin/gigs/${gigId}/remove`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gigs'] })
      toast({ title: 'Gig removed', variant: 'default' })
      setRemoveTarget(null)
    },
    onError: (err: any) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  })

  const gigs = data?.gigs || []

  return (
    <PageTransition>
      <div className="p-6 max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Gigs</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} total gigs</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search gigs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {['ALL', 'POSTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'].map((s) => (
                <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Status' : s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : !gigs.length ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No gigs found</div>
        ) : (
          <div className="space-y-2">
            {gigs.map((gig: any, i: number) => {
              const catConfig = GIG_CATEGORIES.find((c) => c.value === gig.category)
              const hasFlags = gig._count?.aiFlags > 0
              const hasReports = gig._count?.reports > 0

              return (
                <motion.div
                  key={gig.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-soft hover:shadow-card transition-all"
                >
                  <span className="text-xl shrink-0">{catConfig?.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/gigs/${gig.id}`} target="_blank" className="text-sm font-semibold hover:text-brand-600 transition-colors truncate max-w-xs">
                        {gig.title}
                      </Link>
                      <GigStatusBadge status={gig.status} />
                      {hasFlags && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5">{gig._count.aiFlags} flag{gig._count.aiFlags !== 1 ? 's' : ''}</span>}
                      {hasReports && <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">{gig._count.reports} report{gig._count.reports !== 1 ? 's' : ''}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={gig.poster?.profileImage || ''} />
                          <AvatarFallback name={gig.poster?.name || 'P'} className="text-[8px]" />
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{gig.poster?.name}</span>
                      </div>
                      <GigPriceBadge budget={gig.budget} isNegotiable={gig.isNegotiable} size="sm" />
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(gig.createdAt)}</span>
                      <span className="text-xs text-muted-foreground">{gig._count?.applications ?? 0} applied</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/gigs/${gig.id}`} target="_blank" className="gap-2 cursor-pointer">
                          <ExternalLink className="h-4 w-4" /> View Gig
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setRemoveTarget({ id: gig.id, title: gig.title })}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this gig?</DialogTitle>
            <DialogDescription>
              "{removeTarget?.title}" will be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              loading={removeMutation.isPending}
              onClick={() => removeTarget && removeMutation.mutate(removeTarget.id)}
            >
              Remove Gig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
