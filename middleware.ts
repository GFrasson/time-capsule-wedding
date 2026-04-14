import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ACCESS_COOKIE_NAME = 'wedding_guest_access'
const ACCESS_QUERY_PARAM = 'invite'

function isProtectedRoute(pathname: string) {
  if (pathname.startsWith('/capsules/')) return true
  if (pathname.startsWith('/api/capsules/') && pathname.endsWith('/upload')) return true

  return false
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  const configuredToken = process.env.CAPSULE_ACCESS_TOKEN

  if (!configuredToken) {
    return NextResponse.next()
  }

  const inviteToken = searchParams.get(ACCESS_QUERY_PARAM)
  const hasAccessCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value === 'granted'

  if (hasAccessCookie) {
    return NextResponse.next()
  }

  if (inviteToken && inviteToken === configuredToken) {
    const response = NextResponse.next()

    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: 'granted',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 10,
    })

    return response
  }

  const deniedUrl = request.nextUrl.clone()
  deniedUrl.pathname = '/acesso-negado'
  deniedUrl.search = ''

  return NextResponse.redirect(deniedUrl)
}

export const config = {
  matcher: ['/capsules/:path*', '/api/capsules/:path*/upload'],
}
