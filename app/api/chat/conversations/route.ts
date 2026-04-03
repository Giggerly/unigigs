// app/api/chat/conversations/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { chatService } from '@/services/chat/chatService'
import { apiError } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const conversations = await chatService.getUserConversations(session.userId)
    return Response.json({ conversations })
  } catch (err: any) {
    return apiError(err.message || 'Failed to load conversations', 500)
  }
}
