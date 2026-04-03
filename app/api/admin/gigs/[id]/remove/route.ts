// app/api/admin/gigs/[id]/remove/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { adminService } from '@/services/admin/adminService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)
    const body = await req.json().catch(() => ({}))
    await adminService.removeGig(id, body.note)
    return Response.json({ success: true })
  } catch (err: any) {
    return apiError(err.message || 'Failed to remove gig')
  }
}
