// app/api/admin/reports/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { reportService } from '@/services/reports/reportService'
import { apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || undefined

    const data = await reportService.getAllReports({ status, page })
    return Response.json(data)
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch reports', 500)
  }
}
