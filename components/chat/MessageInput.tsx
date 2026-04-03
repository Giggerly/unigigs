// components/chat/MessageInput.tsx
'use client'
import { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CounterOfferModal } from './CounterOfferModal'
import { AttachmentButton } from './AttachmentButton'
import { useSendMessage, useTypingEmitter } from '@/hooks/useChat'
import { useChatStore } from '@/store/chatStore'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  conversationId: string
  disabled?: boolean
  isNegotiable?: boolean
  gigBudget?: number
}

export function MessageInput({
  conversationId,
  disabled,
  isNegotiable,
  gigBudget,
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [offerOpen, setOfferOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sendMessage = useSendMessage(conversationId)
  const { onType, stopTyping } = useTypingEmitter(conversationId)

  // Check if any offer has been accepted in this conversation → lock new offers
  const { messagesByConversation } = useChatStore()
  const messages = messagesByConversation[conversationId] || []
  const hasAcceptedOffer = messages.some(
    (m) => (m.type === 'OFFER' || m.type === 'COUNTER_OFFER') && m.offerStatus === 'accepted'
  )

  const canSend = text.trim().length > 0 && !sendMessage.isPending

  const handleSend = async () => {
    if (!canSend) return
    const content = text.trim()
    setText('')
    stopTyping()
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await sendMessage.mutateAsync({ content, type: 'TEXT' })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onType()
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const handleOffer = async (price: number, eta?: string, note?: string) => {
    const content = note
      ? `${note} (Offer: ₹${price.toLocaleString()})`
      : `I'd like to offer ₹${price.toLocaleString()} for this gig.`
    await sendMessage.mutateAsync({ content, type: 'OFFER', offerPrice: price, offerETA: eta })
    setOfferOpen(false)
  }

  return (
    <>
      {/* Make an Offer — prominent button above input bar when negotiable & no offer accepted yet */}
      {isNegotiable && !hasAcceptedOffer && (
        <div className="border-t border-border bg-gradient-to-r from-brand-50 to-purple-50 px-4 py-2">
          <button
            type="button"
            onClick={() => setOfferOpen(true)}
            className={cn(
              'w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl',
              'bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold text-sm',
              'shadow-lg shadow-brand-600/25 active:scale-[0.98] transition-transform',
              'hover:from-brand-700 hover:to-purple-700'
            )}
          >
            <DollarSign className="h-4 w-4" />
            Make an Offer / Counter-Offer
          </button>
        </div>
      )}

      {/* Offer accepted banner */}
      {hasAcceptedOffer && (
        <div className="border-t border-emerald-200 bg-emerald-50 px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-emerald-700 font-medium">✅ An offer has been accepted — no more offers can be made.</span>
        </div>
      )}

      {/* Main text input area */}
      <div className="border-t border-border bg-white/95 backdrop-blur-xl px-3 py-2.5" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 4px), 10px)' }}>
        <div className={cn(
          'flex items-end gap-2 bg-muted/40 rounded-2xl border border-border px-3 py-2',
          'transition-all duration-200',
          'focus-within:border-brand-300 focus-within:bg-white focus-within:shadow-soft'
        )}>
          {/* Attachment button */}
          <AttachmentButton conversationId={conversationId} disabled={disabled || sendMessage.isPending} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || sendMessage.isPending}
            placeholder="Type a message..."
            rows={1}
            className={cn(
              'flex-1 bg-transparent resize-none text-sm outline-none py-1',
              'placeholder:text-muted-foreground',
              'max-h-[120px] min-h-[24px]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />

          {/* Send button */}
          <AnimatePresence mode="wait">
            {canSend ? (
              <motion.button
                key="send"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                type="button"
                onClick={handleSend}
                className="shrink-0 mb-0.5 h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 transition-colors shadow-brand active:scale-95"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="shrink-0 mb-0.5 h-8 w-8 rounded-xl bg-muted flex items-center justify-center"
              >
                <Send className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-1.5 hidden sm:block">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <CounterOfferModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        onSubmit={handleOffer}
        isLoading={sendMessage.isPending}
        originalPrice={gigBudget}
        type="OFFER"
      />
    </>
  )
}
