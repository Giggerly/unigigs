// services/reports/reportService.ts
import prisma from '@/lib/db/prisma'
import { reportSchema, type ReportInput } from '@/lib/validation/review'

export class ReportService {
  async createReport(reporterId: string, input: ReportInput) {
    const parsed = reportSchema.parse(input)

    // Prevent self-reporting
    if (parsed.reportedUserId === reporterId) {
      throw new Error('Cannot report yourself')
    }

    const report = await prisma.report.create({
      data: {
        reason: parsed.reason,
        description: parsed.description || null,
        targetType: parsed.targetType,
        reporterId,
        gigId: parsed.gigId || null,
        reportedUserId: parsed.reportedUserId || null,
        messageId: parsed.messageId || null,
      },
    })

    return report
  }

  async getAllReports(filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    const where = filters?.status ? { status: filters.status as any } : {}

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, profileImage: true } },
          reportedUser: { select: { id: true, name: true, profileImage: true } },
          gig: { select: { id: true, title: true } },
        },
      }),
      prisma.report.count({ where }),
    ])

    return { reports, total, page, totalPages: Math.ceil(total / limit) }
  }

  async resolveReport(reportId: string, adminNote: string, status: 'RESOLVED' | 'DISMISSED') {
    return prisma.report.update({
      where: { id: reportId },
      data: { status, adminNote, resolvedAt: new Date() },
    })
  }
}

export const reportService = new ReportService()
