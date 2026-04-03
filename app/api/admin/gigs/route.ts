// app/api/admin/gigs/route.ts
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
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const data = await adminService.getAllGigs(page, 20, status, search)
    return Response.json(data)
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch gigs', 500)
  }
}
