// services/gigs/gigService.ts
import prisma from '@/lib/db/prisma'
import { createGigSchema, updateGigSchema, gigFilterSchema } from '@/lib/validation/gig'
import type { CreateGigInput, UpdateGigInput, GigFilterInput } from '@/lib/validation/gig'
import type { Prisma } from '@prisma/client'

const GIG_INCLUDE = {
  poster: {
    select: {
      id: true,
      name: true,
      profileImage: true,
      college: true,
      department: true,
      avgRating: true,
      ratingCount: true,
      completedGigs: true,
    },
  },
  worker: {
    select: {
      id: true,
      name: true,
      profileImage: true,
      avgRating: true,
      completedGigs: true,
    },
  },
  _count: {
    select: {
      applications: true,
      conversations: true,
    },
  },
} satisfies Prisma.GigInclude

export class GigService {
  async listGigs(filters: GigFilterInput) {
    const parsed = gigFilterSchema.parse(filters)
    const { search, category, sort, minBudget, maxBudget, urgent, negotiable, locationMode, page, limit } = parsed

    const skip = (page - 1) * limit

    const where: Prisma.GigWhereInput = {
      status: 'POSTED',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(category && { category: category as any }),
      ...(minBudget !== undefined && { budget: { gte: minBudget } }),
      ...(maxBudget !== undefined && { budget: { lte: maxBudget } }),
      ...(urgent && { isUrgent: true }),
      ...(negotiable && { isNegotiable: true }),
      ...(locationMode && { locationMode: locationMode as any }),
    }

    const orderBy: Prisma.GigOrderByWithRelationInput =
      sort === 'newest'
        ? { createdAt: 'desc' }
        : sort === 'urgent'
        ? { deadline: 'asc' }
        : sort === 'highest_paying'
        ? { budget: 'desc' }
        : sort === 'closing_soon'
        ? { deadline: 'asc' }
        : { createdAt: 'desc' }

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: GIG_INCLUDE,
      }),
      prisma.gig.count({ where }),
    ])

    return {
      gigs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    }
  }

  async getGigById(id: string, viewerId?: string) {
    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        ...GIG_INCLUDE,
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                college: true,
                avgRating: true,
                ratingCount: true,
                completedGigs: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, profileImage: true },
            },
          },
        },
      },
    })

    if (!gig) throw new Error('Gig not found')

    // Increment view count (fire-and-forget)
    if (viewerId !== gig.posterId) {
      prisma.gig.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
    }

    // Check if viewer has applied
    let hasApplied = false
    let userApplication = null
    if (viewerId) {
      userApplication = await prisma.application.findUnique({
        where: { gigId_userId: { gigId: id, userId: viewerId } },
      })
      hasApplied = !!userApplication
    }

    return { ...gig, hasApplied, userApplication }
  }

  async createGig(posterId: string, input: CreateGigInput) {
    const parsed = createGigSchema.parse(input)

    const gig = await prisma.gig.create({
      data: {
        ...parsed,
        deadline: new Date(parsed.deadline),
        posterId,
        expiresAt: new Date(parsed.deadline),
      },
      include: GIG_INCLUDE,
    })

    return gig
  }

  async updateGig(gigId: string, userId: string, input: UpdateGigInput) {
    const gig = await prisma.gig.findUnique({ where: { id: gigId } })
    if (!gig) throw new Error('Gig not found')
    if (gig.posterId !== userId) throw new Error('Not authorized')
    if (gig.status === 'COMPLETED' || gig.status === 'CANCELLED') {
      throw new Error('Cannot edit a completed or cancelled gig')
    }

    const parsed = updateGigSchema.parse(input)

    const updated = await prisma.gig.update({
      where: { id: gigId },
      data: {
        ...parsed,
        ...(parsed.deadline && { deadline: new Date(parsed.deadline) }),
      },
      include: GIG_INCLUDE,
    })

    return updated
  }

  async deleteGig(gigId: string, userId: string, isAdmin = false) {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        conversations: {
          include: {
            participants: { select: { userId: true } },
          },
        },
      },
    })
    if (!gig) throw new Error('Gig not found')
    if (!isAdmin && gig.posterId !== userId) throw new Error('Not authorized')
    if (gig.status === 'IN_PROGRESS') {
      throw new Error('Cannot delete a gig that is in progress')
    }

    // Notify all participants in conversations that the gig was deleted
    const notifiedUsers = new Set<string>()
    for (const conv of gig.conversations) {
      for (const p of conv.participants) {
        if (p.userId !== gig.posterId && !notifiedUsers.has(p.userId)) {
          notifiedUsers.add(p.userId)
          await prisma.notification.create({
            data: {
              userId: p.userId,
              type: 'GIG_STATUS_CHANGE',
              title: 'Gig removed',
              body: `The gig "${gig.title}" has been removed by the poster.`,
              link: '/gigs',
            },
          }).catch(() => {})
        }
      }
    }

    await prisma.gig.delete({ where: { id: gigId } })
    return { success: true }
  }

  async applyToGig(gigId: string, userId: string, message?: string, proposedPrice?: number, proposedETA?: string) {
    const gig = await prisma.gig.findUnique({ where: { id: gigId } })
    if (!gig) throw new Error('Gig not found')
    if (gig.posterId === userId) throw new Error('You cannot apply to your own gig')
    if (gig.status !== 'POSTED') throw new Error('This gig is no longer accepting applications')

    const existing = await prisma.application.findUnique({
      where: { gigId_userId: { gigId, userId } },
    })
    if (existing) throw new Error('You have already applied to this gig')

    const application = await prisma.application.create({
      data: {
        gigId,
        userId,
        message,
        proposedPrice,
        proposedETA: proposedETA ? new Date(proposedETA) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            college: true,
            avgRating: true,
            ratingCount: true,
            completedGigs: true,
          },
        },
      },
    })

    // Create conversation between poster and applicant
    const existingConvo = await prisma.conversation.findFirst({
      where: {
        gigId,
        participants: {
          every: {
            userId: { in: [gig.posterId, userId] },
          },
        },
      },
    })

    if (!existingConvo) {
      const conversation = await prisma.conversation.create({
        data: {
          gigId,
          participants: {
            create: [{ userId: gig.posterId }, { userId }],
          },
        },
      })

      // Inject application as first message so the conversation starts with context
      const firstMsgContent = [
        message ? message : '👋 I\'m interested in this gig and would like to work with you!',
        proposedPrice ? `\n💰 Proposed Price: ₹${proposedPrice.toLocaleString()}` : '',
      ].join('')

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: firstMsgContent,
          type: 'TEXT',
        },
      }).catch(() => {})
    }

    // Notify gig poster
    await prisma.notification.create({
      data: {
        userId: gig.posterId,
        type: 'GIG_RESPONSE',
        title: 'New applicant!',
        body: `${application.user.name} applied to "${gig.title}"`,
        link: `/gigs/${gigId}`,
      },
    })

    return application
  }

  async selectWorker(gigId: string, posterId: string, workerId: string) {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { applications: { select: { userId: true } } },
    })
    if (!gig) throw new Error('Gig not found')
    if (gig.posterId !== posterId) throw new Error('Not authorized')

    const application = await prisma.application.findUnique({
      where: { gigId_userId: { gigId, userId: workerId } },
      include: { user: { select: { name: true } } },
    })
    if (!application) throw new Error('Application not found')

    await prisma.$transaction([
      prisma.gig.update({
        where: { id: gigId },
        data: { status: 'IN_PROGRESS', workerId },
      }),
      prisma.application.update({
        where: { gigId_userId: { gigId, userId: workerId } },
        data: { isSelected: true },
      }),
      prisma.notification.create({
        data: {
          userId: workerId,
          type: 'GIG_SELECTED',
          title: 'You were selected! 🎉',
          body: `You've been selected for "${gig.title}"`,
          link: `/gigs/${gigId}`,
        },
      }),
    ])

    // Auto-reject other applicants with a SYSTEM message + notification
    const otherApplicants = gig.applications.filter((a) => a.userId !== workerId)
    for (const other of otherApplicants) {
      // Find conversation between poster and this applicant
      const conv = await prisma.conversation.findFirst({
        where: {
          gigId,
          AND: [
            { participants: { some: { userId: posterId } } },
            { participants: { some: { userId: other.userId } } },
          ],
        },
      })
      if (conv) {
        await prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: posterId,
            content: `Thank you for your interest in "${gig.title}". Unfortunately, another applicant has been selected for this gig. We hope to work with you in the future!`,
            type: 'SYSTEM',
          },
        }).catch(() => {})
      }
      await prisma.notification.create({
        data: {
          userId: other.userId,
          type: 'GIG_STATUS_CHANGE',
          title: 'Application update',
          body: `Someone else was selected for "${gig.title}". Better luck next time!`,
          link: `/gigs/${gigId}`,
        },
      }).catch(() => {})
    }

    return { success: true }
  }

  async updateGigStatus(gigId: string, userId: string, status: string) {
    const gig = await prisma.gig.findUnique({ where: { id: gigId } })
    if (!gig) throw new Error('Gig not found')

    const isParticipant = gig.posterId === userId || gig.workerId === userId
    if (!isParticipant) throw new Error('Not authorized')

    const allowedTransitions: Record<string, string[]> = {
      POSTED: ['CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'DISPUTED', 'CANCELLED'],
    }

    const allowed = allowedTransitions[gig.status] || []
    if (!allowed.includes(status)) {
      throw new Error(`Cannot transition from ${gig.status} to ${status}`)
    }

    const updated = await prisma.gig.update({
      where: { id: gigId },
      data: {
        status: status as any,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    })

    // Update completed count for worker
    if (status === 'COMPLETED' && gig.workerId) {
      await prisma.user.update({
        where: { id: gig.workerId },
        data: { completedGigs: { increment: 1 } },
      })

      // Notify both parties to rate each other
      await prisma.notification.createMany({
        data: [
          {
            userId: gig.posterId,
            type: 'GIG_STATUS_CHANGE',
            title: 'Gig completed! Leave a review',
            body: `Rate your experience for "${gig.title}"`,
            link: `/gigs/${gigId}`,
          },
          {
            userId: gig.workerId,
            type: 'GIG_STATUS_CHANGE',
            title: 'Gig completed! Leave a review',
            body: `Rate your experience for "${gig.title}"`,
            link: `/gigs/${gigId}`,
          },
        ],
      })
    }

    return updated
  }

  async getMyGigs(userId: string) {
    const gigs = await prisma.gig.findMany({
      where: { posterId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        ...GIG_INCLUDE,
        applications: {
          select: { id: true, isSelected: true },
        },
      },
    })
    return gigs
  }

  async getMyWork(userId: string) {
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        gig: {
          include: GIG_INCLUDE,
        },
      },
    })
    return applications
  }
}

export const gigService = new GigService()
