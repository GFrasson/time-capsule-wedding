import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  ACCESS_COOKIE_NAME,
  createAccessCookie,
  hasValidAccessCookie,
} from './cookie'

describe('capsule-access/cookie', () => {
  const secret = 'super-secret'
  const baseTime = new Date('2026-04-22T12:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(baseTime)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a signed cookie that validates with the same secret', async () => {
    const cookie = await createAccessCookie(secret, true)

    expect(cookie).toMatchObject({
      name: ACCESS_COOKIE_NAME,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    })
    expect(await hasValidAccessCookie(cookie.value, secret)).toBe(true)
  })

  it('rejects a cookie signed with a different secret', async () => {
    const cookie = await createAccessCookie(secret, false)

    expect(await hasValidAccessCookie(cookie.value, 'different-secret')).toBe(false)
  })

  it('rejects malformed cookie values', async () => {
    expect(await hasValidAccessCookie(undefined, secret)).toBe(false)
    expect(await hasValidAccessCookie('invalid', secret)).toBe(false)
    expect(await hasValidAccessCookie('denied.123.signature', secret)).toBe(false)
  })

  it('rejects expired cookies even when the signature matches', async () => {
    const cookie = await createAccessCookie(secret, false)

    vi.advanceTimersByTime((ACCESS_COOKIE_MAX_AGE_SECONDS + 1) * 1000)

    expect(await hasValidAccessCookie(cookie.value, secret)).toBe(false)
  })
})
