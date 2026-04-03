// lib/auth/session.ts
import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from './jwt'

const COOKIE_NAME = 'campusgig-token'

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return await verifyToken(token)
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function getTokenFromCookieHeader(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const tokenCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`))
  if (!tokenCookie) return null
  return tokenCookie.split('=')[1] || null
}
