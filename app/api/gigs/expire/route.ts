// app/api/gigs/expire/route.ts
import { NextRequest } from 'next/server'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'
import prisma from '@/lib/db/prisma'

// Cron secret for security (optional but recommended)
const CRON_SECRET = process.env.CRON_SECRET

export async function POST(req: NextRequest) {
  try {
    // Optionally verify cron secret
    if (CRON_SECRET) {
      const auth = req.headers.get('authorization')
      if (auth !== `Bearer ${CRON_SECRET}`) {
        return apiError('Unauthorized', 401)
      }
    }

    // Find all POSTED gigs whose deadline has passed
    const now = new Date()
    const expiredGigs = await prisma.gig.findMany({
      where: {
        status: 'POSTED',
        deadline: { lt: now },
      },
      select: { id: true, title: true, posterId: true },
    })

    if (expiredGigs.length === 0) {
      return Response.json({ expired: 0, message: 'No gigs to expire' })
    }

    // Batch update all to EXPIRED
    await prisma.gig.updateMany({
      where: { id: { in: expiredGigs.map((g) => g.id) } },
      data: { status: 'EXPIRED' },
    })

    // Notify each poster
    await prisma.notification.createMany({
      data: expiredGigs.map((gig) => ({
        userId: gig.posterId,
        type: 'GIG_STATUS_CHANGE' as const,
        title: 'Gig expired',
        body: `Your gig "${gig.title}" has expired and is no longer visible. You can repost it with a new deadline.`,
        link: '/gigs/my-gigs',
      })),
    })

    return Response.json({
      expired: expiredGigs.length,
      gigIds: expiredGigs.map((g) => g.id),
      message: `${expiredGigs.length} gig(s) marked as expired`,
    })
  } catch (err: any) {
    return apiError(err.message || 'Failed to expire gigs')
  }
}

// Also allow GET for manual trigger in development
export async function GET(req: NextRequest) {
  return POST(req)
}
