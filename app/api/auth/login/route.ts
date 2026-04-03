// app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { authService } from '@/services/auth/authService'
import { apiError } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user, token } = await authService.login(body)

    const cookieStore = await cookies()
    cookieStore.set('campusgig-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return Response.json({ user, token })
  } catch (err: any) {
    return apiError(err.message || 'Login failed', 401)
  }
}
