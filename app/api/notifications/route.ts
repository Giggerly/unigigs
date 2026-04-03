// app/api/notifications/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { notificationService } from '@/services/notifications/notificationService'
import { apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
    const data = await notificationService.getUserNotifications(session.userId, page)
    return Response.json(data)
  } catch (err: any) {
    return apiError(err.message || 'Failed to load notifications', 500)
  }
}
