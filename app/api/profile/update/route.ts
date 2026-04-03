// app/api/profile/update/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { profileService } from '@/services/auth/profileService'
import { apiError } from '@/lib/utils'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const body = await req.json()
    const user = await profileService.updateProfile(session.userId, body)
    return Response.json({ user })
  } catch (err: any) {
    return apiError(err.message || 'Update failed')
  }
}
