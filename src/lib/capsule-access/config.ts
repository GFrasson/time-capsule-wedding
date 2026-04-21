export const ACCESS_QUERY_PARAM = 'invite'

export interface CapsuleAccessConfig {
  inviteToken: string
  cookieSecret: string
}

export function isProtectedCapsuleRoute(pathname: string) {
  if (pathname.startsWith('/capsules/')) {
    return true
  }

  if (pathname.startsWith('/api/capsules/') && pathname.endsWith('/upload')) {
    return true
  }

  return false
}

export function getCapsuleAccessConfig(): CapsuleAccessConfig | null {
  const inviteToken = process.env.CAPSULE_ACCESS_TOKEN

  if (!inviteToken) {
    return null
  }

  return {
    inviteToken,
    cookieSecret: process.env.CAPSULE_ACCESS_COOKIE_SECRET ?? inviteToken,
  }
}
