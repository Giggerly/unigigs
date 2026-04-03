// app/api/reports/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { reportService } from '@/services/reports/reportService'
import { apiError } from '@/lib/utils'
import prisma from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json()
    const report = await reportService.createReport(session.userId, body)

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'SYSTEM_WARN' as any,
          title: '🚨 New Report Submitted',
          body: `A new report (${body.reason || 'OTHER'}) has been submitted and requires review.`,
          link: '/admin/reports',
        })),
      })
    }

    return Response.json({ report }, { status: 201 })
  } catch (err: any) {
    return apiError(err.message || 'Failed to submit report')
  }
}
