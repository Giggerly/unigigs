// app/api/reviews/[userId]/route.ts
import { NextRequest } from 'next/server'
import { reviewService } from '@/services/reviews/reviewService'
import { apiError } from '@/lib/utils'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const data = await reviewService.getUserReviews(userId)
    return Response.json(data)
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch reviews', 500)
  }
}
