import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAccessCookie, hasValidAccessCookie, ACCESS_COOKIE_NAME } from '@/lib/capsule-access/cookie'
import { ACCESS_QUERY_PARAM, getCapsuleAccessConfig, isProtectedCapsuleRoute } from '@/lib/capsule-access/config'

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (!isProtectedCapsuleRoute(pathname)) {
    return NextResponse.next()
  }

  const accessConfig = getCapsuleAccessConfig()

  if (!accessConfig) {
    return NextResponse.next()
  }

  const inviteToken = searchParams.get(ACCESS_QUERY_PARAM)
  const hasAccessCookie = await hasValidAccessCookie(
    request.cookies.get(ACCESS_COOKIE_NAME)?.value,
    accessConfig.cookieSecret
  )

  if (hasAccessCookie) {
    return NextResponse.next()
  }

  if (inviteToken && inviteToken === accessConfig.inviteToken) {
    const response = NextResponse.next()

    response.cookies.set(
      await createAccessCookie(
        accessConfig.cookieSecret,
        process.env.NODE_ENV === 'production'
      )
    )

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
