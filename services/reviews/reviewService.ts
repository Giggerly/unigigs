// services/reviews/reviewService.ts
import prisma from '@/lib/db/prisma'
import { createReviewSchema, type CreateReviewInput } from '@/lib/validation/review'

export class ReviewService {
  async createReview(reviewerId: string, input: CreateReviewInput) {
    const parsed = createReviewSchema.parse(input)
    const { gigId, revieweeId, rating, comment } = parsed

    // Verify gig exists and is completed
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { id: true, status: true, posterId: true, workerId: true },
    })
    if (!gig) throw new Error('Gig not found')
    if (gig.status !== 'COMPLETED') throw new Error('Can only review completed gigs')

    // Reviewer must be a participant
    const isParticipant = gig.posterId === reviewerId || gig.workerId === reviewerId
    if (!isParticipant) throw new Error('Not authorised to review this gig')

    // Cannot review yourself
    if (reviewerId === revieweeId) throw new Error('Cannot review yourself')

    // Reviewee must be the other participant
    const isValidReviewee =
      (reviewerId === gig.posterId && revieweeId === gig.workerId) ||
      (reviewerId === gig.workerId && revieweeId === gig.posterId)
    if (!isValidReviewee) throw new Error('Invalid review target')

    // Prevent duplicate reviews
    const existing = await prisma.review.findUnique({
      where: { gigId_reviewerId: { gigId, reviewerId } },
    })
    if (existing) throw new Error('You have already reviewed this gig')

    // Create review in transaction + update user rating
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          gigId,
          reviewerId,
          revieweeId,
          rating,
          comment: comment || null,
        },
        include: {
          reviewer: {
            select: { id: true, name: true, profileImage: true, college: true },
          },
          gig: { select: { id: true, title: true } },
        },
      })

      // Recalculate reviewee's average rating
      const allRatings = await tx.review.findMany({
        where: { revieweeId },
        select: { rating: true },
      })
      const avg =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length

      await tx.user.update({
        where: { id: revieweeId },
        data: {
          avgRating: Math.round(avg * 10) / 10,
          ratingCount: allRatings.length,
        },
      })

      // Notify reviewee
      await tx.notification.create({
        data: {
          userId: revieweeId,
          type: 'NEW_REVIEW',
          title: 'You got a new review!',
          body: `${rating} star${rating !== 1 ? 's' : ''} from ${newReview.reviewer.name}`,
          link: `/profile/${revieweeId}`,
        },
      })

      return newReview
    })

    return review
  }

  async getUserReviews(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            college: true,
          },
        },
        gig: {
          select: { id: true, title: true },
        },
      },
    })

    // Build rating distribution
    const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
    reviews.forEach((r) => {
      distribution[r.rating.toString() as keyof typeof distribution]++
    })

    return { reviews, distribution }
  }

  async canReview(gigId: string, reviewerId: string, revieweeId: string) {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { status: true, posterId: true, workerId: true },
    })
    if (!gig || gig.status !== 'COMPLETED') return { canReview: false, reason: 'Gig not completed' }

    const isParticipant = gig.posterId === reviewerId || gig.workerId === reviewerId
    if (!isParticipant) return { canReview: false, reason: 'Not a participant' }

    const existing = await prisma.review.findUnique({
      where: { gigId_reviewerId: { gigId, reviewerId } },
    })
    if (existing) return { canReview: false, reason: 'Already reviewed', existingReview: existing }

    return { canReview: true }
  }
}

export const reviewService = new ReviewService()
