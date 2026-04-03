// components/chat/MessageThread.tsx
'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { useChatStore } from '@/store/chatStore'
import { useAuth } from '@/hooks/useAuth'

interface MessageThreadProps {
  conversationId: string
  isLoading: boolean
  otherUserName?: string
}

export function MessageThread({
  conversationId,
  isLoading,
  otherUserName,
}: MessageThreadProps) {
  const { messagesByConversation, typingUsers } = useChatStore()
  const { user } = useAuth()
  const messages = messagesByConversation[conversationId] || []
  const typingSet = typingUsers[conversationId] || new Set()
  const isOtherTyping = typingSet.size > 0
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isOtherTyping])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-2 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
          >
            {i % 2 === 0 && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
            <Skeleton
              className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-40'}`}
            />
          </div>
        ))}
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="text-4xl">👋</div>
        <div>
          <p className="text-sm font-semibold">Start the conversation</p>
          <p className="text-xs text-muted-foreground mt-1">
            Say hello or ask a question about the gig
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-4 px-4 space-y-0.5 scrollbar-thin"
    >
      {messages.map((message, i) => {
        const isMine = message.senderId === user?.id
        const prevMessage = messages[i - 1]
        const nextMessage = messages[i + 1]

        // Group messages from same sender within 3 minutes
        const isGrouped =
          prevMessage?.senderId === message.senderId &&
          new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() <
            3 * 60 * 1000

        const isLastInGroup =
          !nextMessage ||
          nextMessage.senderId !== message.senderId ||
          new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() >
            3 * 60 * 1000

        // Show date separator
        const showDateSep =
          i === 0 ||
          new Date(message.createdAt).toDateString() !==
            new Date(messages[i - 1]?.createdAt).toDateString()

        return (
          <div key={message.id || message.tempId}>
            {showDateSep && (
              <div className="flex justify-center my-4">
                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-3 py-1 font-medium">
                  {new Date(message.createdAt).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            )}
            <MessageBubble
              message={message}
              isMine={isMine}
              showAvatar={!isGrouped && !isMine}
              conversationId={conversationId}
              isLastInGroup={isLastInGroup}
            />
          </div>
        )
      })}

      <TypingIndicator visible={isOtherTyping} name={otherUserName} />

      <div ref={bottomRef} className="h-1" />
    </div>
  )
}
