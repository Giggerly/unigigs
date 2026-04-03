// app/messages/page.tsx
'use client'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ConversationList } from '@/components/chat/ConversationList'
import { PageTransition } from '@/components/ui/PageTransition'
import { useConversations } from '@/hooks/useChat'

export default function MessagesPage() {
  const { data: conversations = [], isLoading } = useConversations()

  return (
    <AppShell fullWidth className="p-0 pb-0">
      <PageTransition className="h-[calc(100dvh-4rem-5rem)] md:h-[calc(100vh-4rem)] flex">

        {/* Sidebar — full on mobile, panel on desktop */}
        <div className="flex-1 md:max-w-sm md:border-r border-border flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Messages</h1>
              <p className="text-xs text-muted-foreground">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            activeConversationId={null}
          />
        </div>

        {/* Empty detail panel — desktop only */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-surface-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-bold mb-1">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a chat from the left to start messaging
            </p>
          </motion.div>
        </div>
      </PageTransition>
    </AppShell>
  )
}
