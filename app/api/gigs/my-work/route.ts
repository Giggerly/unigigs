// app/api/gigs/my-work/route.ts
import { getSession } from '@/lib/auth/session'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const applications = await gigService.getMyWork(session.userId)
    return Response.json({ applications })
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch work history', 500)
  }
}
