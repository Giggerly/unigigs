// app/api/auth/me/route.ts
import { getSession } from '@/lib/auth/session'
import { authService } from '@/services/auth/authService'
import { apiError } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const user = await authService.getMe(session.userId)
    return Response.json({ user })
  } catch (err: any) {
    return apiError(err.message || 'Failed to get user', 500)
  }
}
