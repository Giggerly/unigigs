// app/api/admin/flags/[id]/approve/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { adminService } from '@/services/admin/adminService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

    const { action, adminNote } = await req.json()
    if (!['approve', 'dismiss'].includes(action)) return apiError('Invalid action')

    const flag =
      action === 'approve'
        ? await adminService.approveFlag(id, adminNote || '')
        : await adminService.dismissFlag(id, adminNote || '')

    return Response.json({ flag })
  } catch (err: any) {
    return apiError(err.message || 'Failed to process flag')
  }
}
