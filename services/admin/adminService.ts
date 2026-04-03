// services/admin/adminService.ts
import prisma from '@/lib/db/prisma'

export class AdminService {
  // ─── Gigs ───────────────────────────────────────────────────────────────────
  async getAllGigs(page = 1, limit = 20, status?: string, search?: string) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          poster: { select: { id: true, name: true, profileImage: true, email: true } },
          worker: { select: { id: true, name: true } },
          _count: { select: { applications: true, reports: true, aiFlags: true } },
        },
      }),
      prisma.gig.count({ where }),
    ])

    return { gigs, total, page, totalPages: Math.ceil(total / limit) }
  }

  async removeGig(gigId: string, adminNote?: string) {
    const gig = await prisma.gig.findUnique({ where: { id: gigId } })
    if (!gig) throw new Error('Gig not found')
    await prisma.gig.delete({ where: { id: gigId } })
    return { success: true }
  }

  // ─── Users ──────────────────────────────────────────────────────────────────
  async getAllUsers(page = 1, limit = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          status: true,
          college: true,
          profileImage: true,
          avgRating: true,
          completedGigs: true,
          createdAt: true,
          _count: {
            select: {
              postedGigs: true,
              reportedBy: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return { users, total, page, totalPages: Math.ceil(total / limit) }
  }

  async warnUser(userId: string, note: string, adminId: string) {
    const [user] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { status: 'WARNED' },
        select: { id: true, name: true, status: true },
      }),
      prisma.adminNote.create({
        data: { userId, note, createdBy: adminId },
      }),
      prisma.notification.create({
        data: {
          userId,
          type: 'SYSTEM_WARN',
          title: '⚠️ Account Warning',
          body: 'Your account has received a warning. Please review our community guidelines.',
          link: '/gigs',
        },
      }),
    ])
    return user
  }

  async suspendUser(userId: string, note: string, adminId: string) {
    const [user] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { status: 'SUSPENDED' },
        select: { id: true, name: true, status: true },
      }),
      prisma.adminNote.create({
        data: { userId, note, createdBy: adminId },
      }),
    ])
    return user
  }

  async reinstateUser(userId: string, adminId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
      select: { id: true, name: true, status: true },
    })
  }

  // ─── AI Flags ───────────────────────────────────────────────────────────────
  async getAllFlags(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit
    const where: any = {}
    if (status) where.status = status
    else where.status = 'PENDING'

    const [flags, total] = await Promise.all([
      prisma.aIFlag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          gig: { select: { id: true, title: true, status: true } },
          user: { select: { id: true, name: true, profileImage: true } },
        },
      }),
      prisma.aIFlag.count({ where }),
    ])

    return { flags, total, page, totalPages: Math.ceil(total / limit) }
  }

  async approveFlag(flagId: string, adminNote: string) {
    return prisma.aIFlag.update({
      where: { id: flagId },
      data: { status: 'APPROVED', adminNote, reviewedAt: new Date() },
    })
  }

  async dismissFlag(flagId: string, adminNote: string) {
    return prisma.aIFlag.update({
      where: { id: flagId },
      data: { status: 'REJECTED', adminNote, reviewedAt: new Date() },
    })
  }

  // ─── Analytics ──────────────────────────────────────────────────────────────
  async getAnalytics() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalGigs,
      activeGigs,
      completedGigs,
      totalUsers,
      activeUsers,
      totalReports,
      pendingReports,
      pendingFlags,
      recentGigs,
      categoryBreakdown,
      avgPriceByCategory,
      ratingDistribution,
    ] = await Promise.all([
      prisma.gig.count(),
      prisma.gig.count({ where: { status: 'POSTED' } }),
      prisma.gig.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'USER', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.aIFlag.count({ where: { status: 'PENDING' } }),
      // Daily gig postings last 7 days
      prisma.gig.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Category breakdown
      prisma.gig.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      // Avg price by category
      prisma.gig.groupBy({
        by: ['category'],
        _avg: { budget: true },
      }),
      // Rating distribution
      prisma.review.groupBy({
        by: ['rating'],
        _count: { id: true },
      }),
    ])

    // Build daily activity chart data
    const dailyActivity: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      dailyActivity[d.toISOString().slice(0, 10)] = 0
    }
    recentGigs.forEach((g) => {
      const day = g.createdAt.toISOString().slice(0, 10)
      if (dailyActivity[day] !== undefined) dailyActivity[day]++
    })

    const completionRate = totalGigs > 0 ? Math.round((completedGigs / totalGigs) * 100) : 0

    return {
      overview: {
        totalGigs,
        activeGigs,
        completedGigs,
        totalUsers,
        activeUsers,
        totalReports,
        pendingReports,
        pendingFlags,
        completionRate,
      },
      charts: {
        dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({ date, count })),
        categoryBreakdown: categoryBreakdown.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
        avgPriceByCategory: avgPriceByCategory.map((c) => ({
          category: c.category,
          avgPrice: Math.round(c._avg.budget || 0),
        })),
        ratingDistribution: ratingDistribution.map((r) => ({
          rating: r.rating,
          count: r._count.id,
        })),
      },
    }
  }
}

export const adminService = new AdminService()
