// app/messages/[conversationId]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ExternalLink, MoreVertical, Flag, Star, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { MessageThread } from '@/components/chat/MessageThread'
import { MessageInput } from '@/components/chat/MessageInput'
import { ConversationList } from '@/components/chat/ConversationList'
import { WhatsAppButton } from '@/components/chat/WhatsAppButton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useMessages, useConversations, useConversationSocket, useSendMessage } from '@/hooks/useChat'
import { useChatStore } from '@/store/chatStore'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateGigStatus } from '@/hooks/useGigs'
import { RatingStars } from '@/components/profile/RatingStars'
import { GIG_STATUS_CONFIG } from '@/lib/constants'
import { formatCurrency, cn, isExpired } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveConversation } = useChatStore()
  const queryClient = useQueryClient()

  const [completionRequested, setCompletionRequested] = useState(false)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

  const { data: conversations = [], isLoading: listLoading } = useConversations()
  const { isLoading: messagesLoading } = useMessages(conversationId)
  const sendMessage = useSendMessage(conversationId)

  // Connect socket to this conversation
  useConversationSocket(conversationId)

  useEffect(() => {
    setActiveConversation(conversationId)
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation])

  const activeConv = conversations.find((c: any) => c.id === conversationId)
  const convLoading = listLoading
  const otherParticipant = activeConv?.otherParticipant?.user
  const gig = activeConv?.gig
  const isNegotiable = gig?.status === 'POSTED'
  const statusConfig = gig ? GIG_STATUS_CONFIG[gig.status as keyof typeof GIG_STATUS_CONFIG] : null

  const isPoster = gig?.poster?.id === user?.id
  const isWorker = !isPoster && !!user
  const gigInProgress = gig?.status === 'IN_PROGRESS'
  const gigCompleted = gig?.status === 'COMPLETED'
  const deadlinePassed = gig?.deadline ? isExpired(gig.deadline) : false

  const updateGigStatus = useUpdateGigStatus(gig?.id || '')

  // Poster requests completion
  const handleRequestCompletion = async () => {
    setShowCompleteConfirm(false)
    try {
      await sendMessage.mutateAsync({
        content: `🏁 ${user?.name?.split(' ')[0]} has requested to mark this gig as complete. Do you confirm the work is done?`,
        type: 'TEXT',
      })
      setCompletionRequested(true)
      toast({ title: 'Completion request sent', description: 'Waiting for the worker to confirm.' })
    } catch {
      toast({ title: 'Failed to send request', variant: 'destructive' })
    }
  }

  // Worker accepts completion
  const handleAcceptCompletion = async () => {
    try {
      await updateGigStatus.mutateAsync('COMPLETED')
      await sendMessage.mutateAsync({
        content: '✅ Work confirmed as complete! Gig is now marked COMPLETED.',
        type: 'TEXT',
      })
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      // Navigate to gig page for review
      router.push(`/gigs/${gig?.id}`)
    } catch {
      toast({ title: 'Failed to confirm completion', variant: 'destructive' })
    }
  }

  // Worker declines completion
  const handleDeclineCompletion = async () => {
    try {
      await sendMessage.mutateAsync({
        content: `❌ ${user?.name?.split(' ')[0]} has declined the completion request. Please discuss further.`,
        type: 'TEXT',
      })
      setCompletionRequested(false)
      toast({ title: 'Completion declined', description: 'The poster has been notified.' })
    } catch {
      toast({ title: 'Failed to send response', variant: 'destructive' })
    }
  }

  // Detect if a completion request has been sent (look for the message in chat)
  const { messagesByConversation } = useChatStore()
  const messages = messagesByConversation[conversationId] || []
  const completionRequestMsg = messages.findLast(
    (m) => m.content?.includes('has requested to mark this gig as complete')
  )
  const isCompletionRequested = !!completionRequestMsg && gigInProgress
  const isCompletionRequestedByOther = isCompletionRequested && completionRequestMsg?.senderId !== user?.id

  return (
    <AppShell fullWidth className="p-0 pb-0">
      {/* Fixed height accounting for navbar (4rem) + bottom nav on mobile (5rem) */}
      <div className="h-[calc(100dvh-4rem-5rem)] md:h-[calc(100vh-4rem)] flex">

        {/* Sidebar — desktop only */}
        <div className="hidden md:flex md:w-80 border-r border-border flex-col bg-white shrink-0">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <h2 className="text-base font-bold">Messages</h2>
          </div>
          <ConversationList
            conversations={conversations}
            isLoading={listLoading}
            activeConversationId={conversationId}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 bg-surface-1 overflow-hidden">

          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white/95 backdrop-blur-xl shrink-0">
            {/* Back — mobile */}
            <button
              onClick={() => router.push('/messages')}
              className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Avatar + name */}
            {convLoading || !otherParticipant ? (
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ) : (
              <Link
                href={`/profile/${otherParticipant.id}`}
                className="flex items-center gap-3 flex-1 min-w-0 group"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={otherParticipant.profileImage || ''} alt={otherParticipant.name} />
                  <AvatarFallback name={otherParticipant.name} className="text-sm" />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold group-hover:text-brand-600 transition-colors truncate">
                      {otherParticipant.name}
                    </p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={otherParticipant.avgRating || 0} size="sm" showValue />
                    {otherParticipant.college && (
                      <span className="text-xs text-muted-foreground truncate">
                        · {otherParticipant.college}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Gig chip + actions */}
            <div className="flex items-center gap-2 shrink-0">
              {gig && (
                <Link href={`/gigs/${gig.id}`}>
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted border border-border hover:border-brand-200 hover:bg-brand-50 transition-all max-w-[160px]">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                        statusConfig?.color
                      )}
                    >
                      {statusConfig?.label}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate">{gig.title}</span>
                  </div>
                </Link>
              )}

              {/* WhatsApp shortcut */}
              {otherParticipant?.whatsappNumber && (
                <WhatsAppButton
                  phoneNumber={otherParticipant.whatsappNumber}
                  gigTitle={gig?.title}
                />
              )}

              {/* More menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {gig && (
                    <DropdownMenuItem asChild>
                      <Link href={`/gigs/${gig.id}`} className="gap-2 cursor-pointer">
                        <ExternalLink className="h-4 w-4" />
                        View Gig
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {otherParticipant && (
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${otherParticipant.id}`} className="gap-2 cursor-pointer">
                        <Star className="h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Link
                      href={`/report?${gig ? `gigId=${gig.id}&` : ''}${otherParticipant ? `userId=${otherParticipant.id}` : ''}&conversationId=${conversationId}`}
                    >
                      <Flag className="h-4 w-4" />
                      Report
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Gig context banner */}
          {gig && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-50/70 border-b border-brand-100 shrink-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-brand-600 font-medium shrink-0">Gig:</span>
                <Link
                  href={`/gigs/${gig.id}`}
                  className="text-xs font-semibold text-brand-700 hover:underline truncate"
                >
                  {gig.title}
                </Link>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-brand-700">
                  {formatCurrency(gig.budget)}
                </span>
              </div>
            </motion.div>
          )}

          {/* ── Poster: deadline passed + IN_PROGRESS → request completion ── */}
          <AnimatePresence>
            {isPoster && gigInProgress && deadlinePassed && !completionRequested && !isCompletionRequested && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border-b border-amber-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium">Deadline has passed. Is the work done?</p>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                    onClick={() => setShowCompleteConfirm(true)}
                  >
                    Mark Complete
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Worker: poster requested completion → accept/decline ── */}
          <AnimatePresence>
            {isWorker && isCompletionRequestedByOther && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 border-b border-emerald-200">
                  <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Poster wants to mark work as complete
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                      onClick={handleAcceptCompletion}
                      loading={updateGigStatus.isPending}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-emerald-300"
                      onClick={handleDeclineCompletion}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Completed gig banner ── */}
          {gigCompleted && (
            <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border-b border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">This gig has been completed</span>
              <Link href={`/gigs/${gig?.id}`} className="text-xs text-emerald-700 underline font-semibold">
                Leave a review →
              </Link>
            </div>
          )}

          {/* Message thread */}
          <MessageThread
            conversationId={conversationId}
            isLoading={messagesLoading}
            otherUserName={otherParticipant?.name?.split(' ')[0]}
          />

          {/* Input — hide if completed */}
          {!gigCompleted && (
            <MessageInput
              conversationId={conversationId}
              disabled={!user}
              isNegotiable={isNegotiable}
              gigBudget={gig?.budget}
            />
          )}
        </div>
      </div>

      {/* Completion confirmation modal */}
      <AnimatePresence>
        {showCompleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCompleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-white rounded-3xl shadow-elevated p-6"
            >
              <div className="text-center space-y-3 mb-5">
                <div className="text-4xl">🏁</div>
                <h3 className="text-lg font-bold">Request Completion?</h3>
                <p className="text-sm text-muted-foreground">
                  You'll send a completion request to <strong>{otherParticipant?.name?.split(' ')[0]}</strong>. They'll need to confirm before the gig is marked as complete.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCompleteConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={handleRequestCompletion}
                  loading={sendMessage.isPending}
                >
                  Send Request
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
