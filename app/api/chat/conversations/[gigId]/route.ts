// app/api/chat/conversations/[gigId]/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { chatService } from '@/services/chat/chatService'
import { apiError } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gigId: string }> }
) {
  try {
    const { gigId } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const { searchParams } = req.nextUrl
    const participantId = searchParams.get('participantId')
    if (!participantId) return apiError('participantId is required')

    const conversation = await chatService.getOrCreateConversation(
      gigId,
      session.userId,
      participantId
    )
    return Response.json({ conversation })
  } catch (err: any) {
    return apiError(err.message || 'Failed to load conversation', 500)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gigId: string }> }
) {
  try {
    const { gigId } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const { participantId, initialMessage } = await req.json()
    if (!participantId) return apiError('participantId is required')

    const conversation = await chatService.getOrCreateConversation(
      gigId,
      session.userId,
      participantId
    )

    // Send initial message if provided
    if (initialMessage) {
      await chatService.sendMessage(conversation.id, session.userId, initialMessage)
    }

    return Response.json({ conversation }, { status: 201 })
  } catch (err: any) {
    return apiError(err.message || 'Failed to create conversation')
  }
}
