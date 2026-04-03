// app/api/chat/messages/[conversationId]/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { chatService } from '@/services/chat/chatService'
import { apiError } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const { searchParams } = req.nextUrl
    const cursor = searchParams.get('cursor') || undefined

    const messages = await chatService.getMessages(conversationId, session.userId, cursor)
    return Response.json({ messages })
  } catch (err: any) {
    return apiError(err.message || 'Failed to load messages', 500)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json()
    const { content, type = 'TEXT', offerPrice, offerETA, attachmentUrl, attachmentType } = body

    if (!content?.trim() && !attachmentUrl) return apiError('Message content is required')

    const message = await chatService.sendMessage(
      conversationId,
      session.userId,
      content || '',
      type,
      offerPrice ? parseFloat(offerPrice) : undefined,
      offerETA,
      attachmentUrl,
      attachmentType
    )

    // Emit via Socket.io if available
    const io = (global as any).io
    if (io) {
      io.to(`conversation:${conversationId}`).emit('message:new', message)
    }

    return Response.json({ message }, { status: 201 })
  } catch (err: any) {
    return apiError(err.message || 'Failed to send message')
  }
}

