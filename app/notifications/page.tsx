// app/notifications/page.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell, CheckCheck, MessageSquare, Star, Briefcase, AlertCircle, Zap, X } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications, useMarkNotificationsRead, useUnreadCount } from '@/hooks/useNotifications'
import { formatRelativeTime, cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; gradient: string }> = {
  NEW_MESSAGE:       { icon: MessageSquare, color: 'text-blue-600',    bg: 'bg-blue-50',    gradient: 'from-blue-500 to-cyan-500'    },
  GIG_RESPONSE:      { icon: Briefcase,     color: 'text-brand-600',   bg: 'bg-brand-50',   gradient: 'from-brand-500 to-purple-500'  },
  GIG_STATUS_CHANGE: { icon: AlertCircle,   color: 'text-amber-600',   bg: 'bg-amber-50',   gradient: 'from-amber-500 to-orange-500'  },
  NEW_REVIEW:        { icon: Star,          color: 'text-amber-500',   bg: 'bg-amber-50',   gradient: 'from-yellow-400 to-amber-500'  },
  OFFER_RECEIVED:    { icon: Zap,           color: 'text-purple-600',  bg: 'bg-purple-50',  gradient: 'from-purple-500 to-pink-500'   },
  OFFER_ACCEPTED:    { icon: CheckCheck,    color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-500'  },
  OFFER_REJECTED:    { icon: X,             color: 'text-red-500',     bg: 'bg-red-50',     gradient: 'from-red-500 to-rose-500'     },
  GIG_SELECTED:      { icon: Zap,           color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500 to-teal-500'  },
  SYSTEM_WARN:       { icon: AlertCircle,   color: 'text-red-600',     bg: 'bg-red-50',     gradient: 'from-red-500 to-rose-600'     },
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const unreadCount = useUnreadCount()

  const notifications = data?.notifications ?? []
  const unread = notifications.filter((n: any) => !n.isRead)
  const read = notifications.filter((n: any) => n.isRead)

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markRead.mutate(undefined)}
              loading={markRead.isPending}
              className="gap-2 shrink-0"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border">
                <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !notifications.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <div className="h-20 w-20 rounded-3xl bg-brand-50 flex items-center justify-center">
              <Bell className="h-10 w-10 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold">All caught up!</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              You have no notifications yet. Apply to a gig or post one to get started.
            </p>
            <Link href="/gigs">
              <Button className="mt-2">Browse Gigs</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Unread */}
            {unread.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Unread
                </h2>
                <div className="space-y-2">
                  {unread.map((notif: any, i: number) => (
                    <NotifCard key={notif.id} notif={notif} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Read */}
            {read.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Earlier
                </h2>
                <div className="space-y-2 opacity-75">
                  {read.map((notif: any, i: number) => (
                    <NotifCard key={notif.id} notif={notif} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function NotifCard({ notif, index }: { notif: any; index: number }) {
  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.GIG_RESPONSE
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        href={notif.link || '/gigs'}
        className={cn(
          'flex items-start gap-4 p-4 rounded-2xl border transition-all',
          'hover:shadow-soft hover:-translate-y-0.5',
          notif.isRead
            ? 'bg-white border-border'
            : 'bg-brand-50/40 border-brand-100'
        )}
      >
        <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', config.bg)}>
          <Icon className={cn('h-6 w-6', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-snug', !notif.isRead ? 'font-bold' : 'font-semibold')}>
            {notif.title}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {notif.body}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {formatRelativeTime(notif.createdAt)}
          </p>
        </div>
        {!notif.isRead && (
          <div className="h-2.5 w-2.5 rounded-full bg-brand-600 mt-2 shrink-0" />
        )}
      </Link>
    </motion.div>
  )
}
