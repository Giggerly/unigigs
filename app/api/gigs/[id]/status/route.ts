// app/api/gigs/[id]/status/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const { status } = await req.json()
    if (!status) return apiError('Status is required')

    const gig = await gigService.updateGigStatus(id, session.userId, status)
    return Response.json({ gig })
  } catch (err: any) {
    return apiError(err.message || 'Failed to update status')
  }
}
