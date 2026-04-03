// components/chat/OfferCard.tsx
'use client'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ArrowLeftRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface OfferCardProps {
  messageId: string
  price: number
  eta?: string | null
  status?: string | null
  type: 'OFFER' | 'COUNTER_OFFER'
  isMine: boolean
  onAccept?: () => void
  onReject?: () => void
  onCounter?: () => void
  isLoading?: boolean
  isLocked?: boolean
}

export function OfferCard({
  messageId,
  price,
  eta,
  status,
  type,
  isMine,
  onAccept,
  onReject,
  onCounter,
  isLoading,
  isLocked,
}: OfferCardProps) {
  const isAccepted = status === 'accepted'
  const isRejected = status === 'rejected'
  const isPending = !status || status === 'pending'

  const label = type === 'OFFER' ? 'Offer' : 'Counter-Offer'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-full max-w-xs rounded-2xl border overflow-hidden shadow-soft',
        isAccepted
          ? 'border-emerald-200 bg-emerald-50'
          : isRejected
          ? 'border-gray-200 bg-gray-50 opacity-70'
          : 'border-brand-200 bg-gradient-to-br from-brand-50 to-white'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2.5',
          isAccepted
            ? 'bg-emerald-100'
            : isRejected
            ? 'bg-gray-100'
            : 'bg-brand-100'
        )}
      >
        <ArrowLeftRight
          className={cn(
            'h-4 w-4',
            isAccepted ? 'text-emerald-600' : isRejected ? 'text-gray-500' : 'text-brand-600'
          )}
        />
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wide',
            isAccepted ? 'text-emerald-700' : isRejected ? 'text-gray-600' : 'text-brand-700'
          )}
        >
          {label}
        </span>
        {isAccepted && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" />
            Accepted
          </span>
        )}
        {isRejected && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-gray-500">
            <XCircle className="h-3.5 w-3.5" />
            Declined
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(price)}
          </span>
        </div>

        {eta && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            By {formatDate(eta, 'MMM d, h:mm a')}
          </div>
        )}
      </div>

      {/* Actions (only for recipient when pending and not locked) */}
      {!isMine && isPending && !isLocked && (
        <div className="flex items-center gap-2 px-4 pb-4">
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
            onClick={onAccept}
            loading={isLoading}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Accept
          </Button>
          {onCounter && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={onCounter}
              disabled={isLoading}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Counter
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="px-2 text-destructive hover:text-destructive"
            onClick={onReject}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!isMine && isPending && isLocked && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground italic">🔒 Another offer was already accepted</p>
        </div>
      )}

      {isMine && isPending && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground italic">Waiting for response...</p>
        </div>
      )}
    </motion.div>
  )
}
