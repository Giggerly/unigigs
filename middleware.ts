// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

const PUBLIC_ROUTES = ['/login', '/register', '/']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/gigs', '/messages', '/profile', '/my-work']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('campusgig-token')?.value

  // Check if public route
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith('/api/auth/'))

  // Admin routes
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/gigs', request.url))
    }
    return NextResponse.next()
  }

  // Protected routes
  const isProtected = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    const payload = await verifyToken(token)
    if (!payload) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && token) {
    const payload = await verifyToken(token)
    if (payload) {
      return NextResponse.redirect(new URL('/gigs', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|uploads).*)'],
}
