// app/api/gigs/my-gigs/route.ts
import { getSession } from '@/lib/auth/session'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const gigs = await gigService.getMyGigs(session.userId)
    return Response.json({ gigs })
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch gigs', 500)
  }
}
