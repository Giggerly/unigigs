// components/chat/ConversationItem.tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, truncate, cn } from '@/lib/utils'

interface ConversationItemProps {
  conversation: {
    id: string
    gig: {
      id: string
      title: string
      status: string
    }
    otherParticipant?: {
      userId: string
      user: {
        id: string
        name: string
        profileImage?: string | null
        college?: string | null
      }
    }
    messages?: Array<{
      content: string
      type: string
      senderId: string
      createdAt: string
      isRead: boolean
    }>
    unreadCount?: number
    lastMessageAt: string
  }
  isActive?: boolean
  currentUserId: string
  index?: number
}

export function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  index = 0,
}: ConversationItemProps) {
  const other = conversation.otherParticipant?.user
  const lastMsg = conversation.messages?.[0]
  const unread = conversation.unreadCount || 0
  const hasUnread = unread > 0 && lastMsg?.senderId !== currentUserId

  const lastMessagePreview = () => {
    if (!lastMsg) return 'No messages yet'
    if (lastMsg.type === 'OFFER') return '💰 Sent an offer'
    if (lastMsg.type === 'COUNTER_OFFER') return '↔️ Counter-offer'
    if (lastMsg.type === 'SYSTEM') return lastMsg.content
    if (lastMsg.senderId === currentUserId) return `You: ${lastMsg.content}`
    return lastMsg.content
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/messages/${conversation.id}`}>
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-150',
            isActive
              ? 'bg-brand-50 border border-brand-100'
              : 'hover:bg-muted border border-transparent',
            hasUnread && !isActive && 'bg-blue-50/30'
          )}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-11 w-11">
              <AvatarImage src={other?.profileImage || ''} alt={other?.name || 'User'} />
              <AvatarFallback name={other?.name || 'U'} className="text-sm" />
            </Avatar>
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-600 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className={cn('text-sm leading-tight', hasUnread ? 'font-bold' : 'font-semibold')}>
                {other?.name || 'Unknown User'}
              </p>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                {formatRelativeTime(conversation.lastMessageAt)}
              </span>
            </div>

            {/* Gig title */}
            <p className="text-xs text-brand-600 font-medium mt-0.5 truncate uppercase tracking-tight">
              Gig: {conversation.gig.title}
            </p>

            {/* Last message */}
            <p
              className={cn(
                'text-xs mt-1 line-clamp-1 leading-relaxed',
                hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {truncate(lastMessagePreview(), 60)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
