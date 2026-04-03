// app/api/gigs/[id]/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    const gig = await gigService.getGigById(id, session?.userId)
    return Response.json({ gig })
  } catch (err: any) {
    return apiError(err.message || 'Gig not found', 404)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json()
    const gig = await gigService.updateGig(id, session.userId, {
      ...body,
      budget: body.budget ? parseFloat(body.budget) : undefined,
    })
    return Response.json({ gig })
  } catch (err: any) {
    return apiError(err.message || 'Failed to update gig')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const isAdmin = session.role === 'ADMIN'
    await gigService.deleteGig(id, session.userId, isAdmin)
    return Response.json({ success: true })
  } catch (err: any) {
    return apiError(err.message || 'Failed to delete gig')
  }
}
