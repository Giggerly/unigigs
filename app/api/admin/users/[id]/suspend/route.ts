// app/api/admin/users/[id]/suspend/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { adminService } from '@/services/admin/adminService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)
    const { note } = await req.json()
    const user = await adminService.suspendUser(id, note || 'Account suspended', session.userId)
    return Response.json({ user })
  } catch (err: any) {
    return apiError(err.message || 'Failed to suspend user')
  }
}
