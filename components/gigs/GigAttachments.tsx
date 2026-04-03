// components/gigs/GigAttachments.tsx
import { FileText, Image, Download } from 'lucide-react'

interface GigAttachmentsProps {
  attachments: string[]
}

export function GigAttachments({ attachments }: GigAttachmentsProps) {
  if (!attachments.length) return null

  const getIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return Image
    return FileText
  }

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Attachment'
  }

  const isImage = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')
  }

  return (
    <div className="space-y-2">
      {/* Image previews */}
      {attachments.some(isImage) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {attachments.filter(isImage).map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity"
            >
              <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      )}

      {/* File attachments */}
      {attachments.filter((u) => !isImage(u)).map((url, i) => {
        const Icon = getIcon(url)
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors group"
          >
            <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <Icon className="h-4.5 w-4.5 text-brand-600" />
            </div>
            <span className="text-sm font-medium truncate flex-1">{getFileName(url)}</span>
            <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        )
      })}
    </div>
  )
}
