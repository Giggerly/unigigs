// components/chat/ReadReceipt.tsx
import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReadReceiptProps {
  isRead: boolean
  isSending?: boolean
  isError?: boolean
  className?: string
}

export function ReadReceipt({ isRead, isSending, isError, className }: ReadReceiptProps) {
  if (isError) {
    return (
      <span className={cn('text-[10px] text-destructive font-medium', className)}>
        Failed
      </span>
    )
  }

  if (isSending) {
    return (
      <span className={cn('text-[10px] text-white/50', className)}>
        <Check className="h-3 w-3" />
      </span>
    )
  }

  return (
    <span className={cn('transition-colors duration-300', className)}>
      {isRead ? (
        <CheckCheck className="h-3.5 w-3.5 text-brand-300" />
      ) : (
        <Check className="h-3.5 w-3.5 text-white/60" />
      )}
    </span>
  )
}
