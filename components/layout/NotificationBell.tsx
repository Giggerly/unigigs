// components/layout/NotificationBell.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, MessageSquare, Star, Briefcase, AlertCircle, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications, useMarkNotificationsRead, useUnreadCount } from '@/hooks/useNotifications'
import { formatRelativeTime, cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  NEW_MESSAGE:       { icon: MessageSquare, color: 'text-blue-600',    bg: 'bg-blue-50'    },
  GIG_RESPONSE:      { icon: Briefcase,     color: 'text-brand-600',   bg: 'bg-brand-50'   },
  GIG_STATUS_CHANGE: { icon: AlertCircle,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
  NEW_REVIEW:        { icon: Star,          color: 'text-amber-500',   bg: 'bg-amber-50'   },
  OFFER_RECEIVED:    { icon: Zap,           color: 'text-purple-600',  bg: 'bg-purple-50'  },
  OFFER_ACCEPTED:    { icon: CheckCheck,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  OFFER_REJECTED:    { icon: X,             color: 'text-red-500',     bg: 'bg-red-50'     },
  GIG_SELECTED:      { icon: Zap,           color: 'text-emerald-600', bg: 'bg-emerald-50' },
  SYSTEM_WARN:       { icon: AlertCircle,   color: 'text-red-600',     bg: 'bg-red-50'     },
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const unreadCount = useUnreadCount()

  const notifications = data?.notifications ?? []

  const handleOpen = () => {
    setOpen(true)
    if (unreadCount > 0) {
      markRead.mutate(undefined)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-brand-600 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white px-0.5"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl border border-border shadow-elevated overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markRead.mutate(undefined)}
                    className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors flex items-center gap-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-4">
                      <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : !notifications.length ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <span className="text-3xl">🔔</span>
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif: any, i: number) => {
                    const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.GIG_RESPONSE
                    const Icon = config.icon

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link
                          href={notif.link || '/gigs'}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors',
                            !notif.isRead && 'bg-brand-50/30'
                          )}
                        >
                          <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
                            <Icon className={cn('h-4 w-4', config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs leading-snug', !notif.isRead ? 'font-semibold' : 'font-medium')}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.body}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatRelativeTime(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div className="h-2 w-2 rounded-full bg-brand-600 mt-1 shrink-0" />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2.5">
                  <Link
                    href="/notifications"
                    onClick={() => setOpen(false)}
                    className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors"
                  >
                    View all notifications →
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
