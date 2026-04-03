// app/api/gigs/[id]/select/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const { workerId } = await req.json()
    if (!workerId) return apiError('workerId is required')

    const result = await gigService.selectWorker(id, session.userId, workerId)
    return Response.json(result)
  } catch (err: any) {
    return apiError(err.message || 'Failed to select worker')
  }
}
