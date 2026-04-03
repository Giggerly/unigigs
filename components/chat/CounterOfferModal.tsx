// components/chat/CounterOfferModal.tsx
'use client'
import { useState } from 'react'
import { ArrowLeftRight, Clock, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

interface CounterOfferModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (price: number, eta?: string, note?: string) => void
  isLoading?: boolean
  originalPrice?: number
  type?: 'OFFER' | 'COUNTER_OFFER'
}

export function CounterOfferModal({
  open,
  onClose,
  onSubmit,
  isLoading,
  originalPrice,
  type = 'OFFER',
}: CounterOfferModalProps) {
  const [price, setPrice] = useState(originalPrice?.toString() || '')
  const [eta, setEta] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    const p = parseFloat(price)
    if (!p || p <= 0) return
    onSubmit(p, eta || undefined, note || undefined)
  }

  const label = type === 'OFFER' ? 'Make an Offer' : 'Counter-Offer'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-brand-600" />
            {label}
          </DialogTitle>
          <DialogDescription>
            {type === 'COUNTER_OFFER'
              ? 'Propose an alternative price or timeline'
              : 'Send a price offer to negotiate the deal'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Price */}
          <div className="space-y-1.5">
            <Label>Your Price (₹) <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={originalPrice ? `Original: ${formatCurrency(originalPrice)}` : '500'}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              leftIcon={<span className="font-medium text-sm">₹</span>}
              min={1}
            />
            {originalPrice && parseFloat(price) > 0 && parseFloat(price) !== originalPrice && (
              <p className="text-xs text-muted-foreground">
                {parseFloat(price) < originalPrice
                  ? `₹${(originalPrice - parseFloat(price)).toLocaleString()} less than listed`
                  : `₹${(parseFloat(price) - originalPrice).toLocaleString()} more than listed`}
              </p>
            )}
          </div>

          {/* ETA */}
          <div className="space-y-1.5">
            <Label>
              Completion By{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              type="datetime-local"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label>
              Note{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              placeholder="Explain your offer or any conditions..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[70px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!price || parseFloat(price) <= 0}
            className="gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Send {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
