// app/api/gigs/[id]/apply/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json()
    const application = await gigService.applyToGig(
      id,
      session.userId,
      body.message,
      body.proposedPrice ? parseFloat(body.proposedPrice) : undefined,
      body.proposedETA
    )

    return Response.json({ application }, { status: 201 })
  } catch (err: any) {
    return apiError(err.message || 'Failed to apply')
  }
}
