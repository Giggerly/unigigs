// app/api/admin/analytics/route.ts
import { getSession } from '@/lib/auth/session'
import { adminService } from '@/services/admin/adminService'
import { apiError } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

    const data = await adminService.getAnalytics()
    return Response.json(data)
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch analytics', 500)
  }
}
