// components/chat/MessageBubble.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw, FileText, Download, X, ZoomIn } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OfferCard } from './OfferCard'
import { CounterOfferModal } from './CounterOfferModal'
import { ReadReceipt } from './ReadReceipt'
import { useSendMessage, useOfferResponse } from '@/hooks/useChat'
import { useChatStore } from '@/store/chatStore'
import { formatDate, cn } from '@/lib/utils'
import type { ChatMessage } from '@/store/chatStore'

interface MessageBubbleProps {
  message: ChatMessage
  isMine: boolean
  showAvatar: boolean
  conversationId: string
  isLastInGroup: boolean
}

export function MessageBubble({
  message,
  isMine,
  showAvatar,
  conversationId,
  isLastInGroup,
}: MessageBubbleProps) {
  const [counterOpen, setCounterOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const offerResponse = useOfferResponse(conversationId)
  const sendMessage = useSendMessage(conversationId)

  // Check if any offer has already been accepted → lock action buttons
  const { messagesByConversation } = useChatStore()
  const allMessages = messagesByConversation[conversationId] || []
  const offerLocked = allMessages.some(
    (m) => (m.type === 'OFFER' || m.type === 'COUNTER_OFFER') && m.offerStatus === 'accepted'
  )

  const isOffer = message.type === 'OFFER' || message.type === 'COUNTER_OFFER'
  const isSystem = message.type === 'SYSTEM'
  const hasImage = message.attachmentType === 'IMAGE' && message.attachmentUrl
  const hasPDF = message.attachmentType === 'PDF' && message.attachmentUrl

  // System message — centred pill
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    )
  }

  const handleAccept = () => {
    offerResponse.mutate({ messageId: message.id, status: 'accepted' })
  }

  const handleReject = () => {
    offerResponse.mutate({ messageId: message.id, status: 'rejected' })
  }

  const handleCounter = async (price: number, eta?: string, note?: string) => {
    const content = note || `Counter-offer: ₹${price.toLocaleString()}`
    await sendMessage.mutateAsync({
      content,
      type: 'COUNTER_OFFER',
      offerPrice: price,
      offerETA: eta,
    })
    setCounterOpen(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={cn(
          'flex items-end gap-2',
          isMine ? 'flex-row-reverse' : 'flex-row',
          isLastInGroup ? 'mb-3' : 'mb-0.5'
        )}
      >
        {/* Avatar */}
        <div className={cn('shrink-0 w-7', isMine ? 'hidden' : 'block')}>
          {showAvatar ? (
            <Avatar className="h-7 w-7">
              <AvatarImage src={message.sender?.profileImage || ''} alt={message.sender?.name} />
              <AvatarFallback name={message.sender?.name || 'U'} className="text-[10px]" />
            </Avatar>
          ) : (
            <div className="h-7 w-7" />
          )}
        </div>

        {/* Bubble content */}
        <div className={cn('flex flex-col max-w-[75%]', isMine ? 'items-end' : 'items-start')}>
          {isOffer ? (
            <OfferCard
              messageId={message.id}
              price={message.offerPrice!}
              eta={message.offerETA}
              status={message.offerStatus}
              type={message.type as 'OFFER' | 'COUNTER_OFFER'}
              isMine={isMine}
              onAccept={offerLocked ? undefined : handleAccept}
              onReject={offerLocked ? undefined : handleReject}
              onCounter={offerLocked ? undefined : () => setCounterOpen(true)}
              isLoading={offerResponse.isPending}
              isLocked={offerLocked}
            />
          ) : hasImage ? (
            /* Image attachment */
            <div className={cn('rounded-2xl overflow-hidden border border-border shadow-soft', isMine ? 'rounded-br-sm' : 'rounded-bl-sm')}>
              <button onClick={() => setLightboxOpen(true)} className="block relative group">
                <img
                  src={message.attachmentUrl!}
                  alt={message.content || 'Image'}
                  className="max-w-[220px] max-h-[200px] object-cover w-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
              {message.content && message.content !== '' && (
                <div className={cn('px-3 py-1.5 text-xs', isMine ? 'bg-brand-600 text-white' : 'bg-muted text-foreground')}>
                  {message.content}
                </div>
              )}
            </div>
          ) : hasPDF ? (
            /* PDF attachment */
            <a
              href={message.attachmentUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-soft max-w-[220px]',
                isMine
                  ? 'bg-brand-600 text-white border-brand-500 rounded-br-sm hover:bg-brand-700'
                  : 'bg-white text-foreground border-border rounded-bl-sm hover:bg-muted'
              )}
            >
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', isMine ? 'bg-brand-500' : 'bg-red-100')}>
                <FileText className={cn('h-5 w-5', isMine ? 'text-white' : 'text-red-600')} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{message.content || 'Document'}</p>
                <p className={cn('text-[10px]', isMine ? 'text-brand-200' : 'text-muted-foreground')}>PDF · Tap to open</p>
              </div>
              <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </a>
          ) : (
            <div
              className={cn(
                'px-4 py-2.5 text-sm leading-relaxed break-words',
                'max-w-full rounded-2xl',
                isMine
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm',
                message.isError && 'opacity-60 border border-destructive/30'
              )}
            >
              {message.content}
            </div>
          )}

          {/* Timestamp + read receipt */}
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              isMine ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <span className="text-[10px] text-muted-foreground">
              {formatDate(message.createdAt, 'h:mm a')}
            </span>
            {isMine && (
              <ReadReceipt
                isRead={message.isRead}
                isSending={message.isSending}
                isError={message.isError}
              />
            )}
            {message.isError && (
              <button
                className="text-[10px] text-destructive flex items-center gap-0.5 hover:underline"
                onClick={() => {/* retry logic */}}
              >
                <RefreshCw className="h-2.5 w-2.5" />
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Counter-offer modal */}
        <CounterOfferModal
          open={counterOpen}
          onClose={() => setCounterOpen(false)}
          onSubmit={handleCounter}
          isLoading={sendMessage.isPending}
          originalPrice={message.offerPrice || undefined}
          type="COUNTER_OFFER"
        />
      </motion.div>

      {/* Lightbox for image preview */}
      <AnimatePresence>
        {lightboxOpen && hasImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={message.attachmentUrl!}
              alt={message.content || 'Image'}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
