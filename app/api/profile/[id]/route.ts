// app/api/profile/[id]/route.ts
import { NextRequest } from 'next/server'
import { profileService } from '@/services/auth/profileService'
import { apiError } from '@/lib/utils'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profile = await profileService.getProfile(id)
    return Response.json({ profile })
  } catch (err: any) {
    return apiError(err.message || 'Profile not found', 404)
  }
}
