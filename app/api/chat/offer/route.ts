// app/api/chat/offer/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { chatService } from '@/services/chat/chatService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const { messageId, status } = await req.json()
    if (!messageId || !status) return apiError('messageId and status are required')
    if (!['accepted', 'rejected'].includes(status)) return apiError('Invalid status')

    const message = await chatService.respondToOffer(messageId, session.userId, status)

    // Emit via Socket.io
    const io = (global as any).io
    if (io) {
      io.to(`conversation:${message.conversationId}`).emit('offer:response', {
        messageId,
        status,
        responderId: session.userId,
      })
    }

    return Response.json({ message })
  } catch (err: any) {
    return apiError(err.message || 'Failed to respond to offer')
  }
}
