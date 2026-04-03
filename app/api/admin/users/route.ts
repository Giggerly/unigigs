// app/api/admin/users/route.ts
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
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined

    const data = await adminService.getAllUsers(page, 20, search, status)
    return Response.json(data)
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch users', 500)
  }
}
