// app/api/gigs/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { gigService } from '@/services/gigs/gigService'
import { apiError } from '@/lib/utils'
import { gigFilterSchema } from '@/lib/validation/gig'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const filters = gigFilterSchema.parse({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      sort: searchParams.get('sort') || 'newest',
      minBudget: searchParams.get('minBudget') || undefined,
      maxBudget: searchParams.get('maxBudget') || undefined,
      urgent: searchParams.get('urgent') || undefined,
      negotiable: searchParams.get('negotiable') || undefined,
      locationMode: searchParams.get('locationMode') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 12,
    })

    const result = await gigService.listGigs(filters)
    return Response.json(result)
  } catch (err: any) {
    return apiError(err.message || 'Failed to fetch gigs', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json()
    const gig = await gigService.createGig(session.userId, {
      ...body,
      budget: parseFloat(body.budget),
    })

    return Response.json({ gig }, { status: 201 })
  } catch (err: any) {
    return apiError(err.message || 'Failed to create gig')
  }
}
