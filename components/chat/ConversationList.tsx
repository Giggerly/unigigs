// components/chat/ConversationList.tsx
'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConversationItem } from './ConversationItem'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  conversations: any[]
  isLoading: boolean
  activeConversationId?: string | null
}

export function ConversationList({
  conversations,
  isLoading,
  activeConversationId,
}: ConversationListProps) {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const other = c.otherParticipant?.user
    const term = search.toLowerCase()
    return (
      other?.name?.toLowerCase().includes(term) ||
      c.gig?.title?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full h-9 pl-9 pr-3 rounded-xl bg-muted border-0 text-sm',
              'outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white',
              'placeholder:text-muted-foreground transition-all duration-200'
            )}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-11 w-11 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="💬"
            title={search ? 'No results' : 'No conversations yet'}
            description={
              search
                ? 'Try a different search term'
                : 'Apply to a gig or get an application to start chatting'
            }
          />
        ) : (
          filtered.map((conv, i) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              currentUserId={user?.id || ''}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  )
}
