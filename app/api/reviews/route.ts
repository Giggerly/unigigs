// app/api/reviews/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { reviewService } from '@/services/reviews/reviewService'
import { apiError } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json()
    const review = await reviewService.createReview(session.userId, {
      ...body,
      rating: parseInt(body.rating),
    })
    return Response.json({ review }, { status: 201 })
  } catch (err: any) {
    return apiError(err.message || 'Failed to submit review')
  }
}
