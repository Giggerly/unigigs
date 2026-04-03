// app/api/admin/flags/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { adminService } from '@/services/admin/adminService'
import { apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || 'PENDING'

    const data = await adminService.getAllFlags(page, 20, status)
    return Response.json(data)
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch flags', 500)
  }
}
