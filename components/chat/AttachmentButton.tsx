// components/chat/AttachmentButton.tsx
'use client'
import { useRef, useState } from 'react'
import { Paperclip, Loader2 } from 'lucide-react'
import { useSendMessage } from '@/hooks/useChat'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface AttachmentButtonProps {
  conversationId: string
  disabled?: boolean
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function AttachmentButton({ conversationId, disabled }: AttachmentButtonProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const sendMessage = useSendMessage(conversationId)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so same file can be re-selected
    e.target.value = ''

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Unsupported file type', description: 'Only images and PDFs are allowed.', variant: 'destructive' })
      return
    }
    if (file.size > MAX_SIZE) {
      toast({ title: 'File too large', description: 'Max file size is 5MB.', variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')

      const url: string = json.urls[0]
      const isImage = file.type.startsWith('image/')
      const attachmentType = isImage ? 'IMAGE' : 'PDF'

      await sendMessage.mutateAsync({
        content: file.name,
        type: 'TEXT',
        attachmentUrl: url,
        attachmentType,
      })
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={disabled || uploading || sendMessage.isPending}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-colors',
          uploading
            ? 'bg-muted text-muted-foreground cursor-wait'
            : 'text-muted-foreground hover:text-brand-600 hover:bg-brand-50',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        title="Attach image or PDF"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </button>
    </>
  )
}
