const ACCESS_COOKIE_NAME = 'wedding_guest_access'
const ACCESS_COOKIE_STATUS = 'granted'
const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function encodeBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

async function signCookiePayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  )

  return encodeBase64Url(new Uint8Array(signature))
}

export async function hasValidAccessCookie(
  cookieValue: string | undefined,
  secret: string
) {
  if (!cookieValue) {
    return false
  }

  const [status, expiresAtRaw, signature] = cookieValue.split('.')

  if (status !== ACCESS_COOKIE_STATUS || !expiresAtRaw || !signature) {
    return false
  }

  const expiresAt = Number(expiresAtRaw)

  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false
  }

  const payload = `${status}.${expiresAtRaw}`
  const expectedSignature = await signCookiePayload(payload, secret)

  return signature === expectedSignature
}

export async function createAccessCookie(secret: string, isProduction: boolean) {
  const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_COOKIE_MAX_AGE_SECONDS
  const payload = `${ACCESS_COOKIE_STATUS}.${expiresAt}`
  const signature = await signCookiePayload(payload, secret)

  return {
    name: ACCESS_COOKIE_NAME,
    value: `${payload}.${signature}`,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
  }
}

export { ACCESS_COOKIE_NAME, ACCESS_COOKIE_MAX_AGE_SECONDS }
