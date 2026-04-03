// app/api/notifications/read/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { notificationService } from '@/services/notifications/notificationService'
import { apiError } from '@/lib/utils'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json().catch(() => ({}))

    if (body.notificationId) {
      await notificationService.markRead(body.notificationId, session.userId)
    } else {
      await notificationService.markAllRead(session.userId)
    }

    return Response.json({ success: true })
  } catch (err: any) {
    return apiError(err.message || 'Failed to mark notifications', 500)
  }
}
