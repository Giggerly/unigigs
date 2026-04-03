// app/api/admin/reports/[id]/resolve/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { reportService } from '@/services/reports/reportService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return apiError('Forbidden', 403)

    const { adminNote, status } = await req.json()
    if (!['RESOLVED', 'DISMISSED'].includes(status)) return apiError('Invalid status')

    const report = await reportService.resolveReport(id, adminNote || '', status)
    return Response.json({ report })
  } catch (err: any) {
    return apiError(err.message || 'Failed to resolve report')
  }
}
