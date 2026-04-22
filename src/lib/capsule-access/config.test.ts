import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getCapsuleAccessConfig,
  isProtectedCapsuleRoute,
} from './config'

describe('capsule-access/config', () => {
  beforeEach(() => {
    vi.stubEnv('CAPSULE_ACCESS_TOKEN', undefined)
    vi.stubEnv('CAPSULE_ACCESS_COOKIE_SECRET', undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('marks capsule routes as protected', () => {
    expect(isProtectedCapsuleRoute('/capsules/abc')).toBe(true)
    expect(isProtectedCapsuleRoute('/capsules/abc/share')).toBe(true)
  })

  it('does not mark unrelated routes as protected', () => {
    expect(isProtectedCapsuleRoute('/')).toBe(false)
    expect(isProtectedCapsuleRoute('/api/media')).toBe(false)
  })

  it('returns null when the invite token is not configured', () => {
    expect(getCapsuleAccessConfig()).toBeNull()
  })

  it('uses the invite token as the fallback cookie secret', () => {
    vi.stubEnv('CAPSULE_ACCESS_TOKEN', 'invite-token')

    expect(getCapsuleAccessConfig()).toEqual({
      inviteToken: 'invite-token',
      cookieSecret: 'invite-token',
    })
  })

  it('uses the explicit cookie secret when provided', () => {
    vi.stubEnv('CAPSULE_ACCESS_TOKEN', 'invite-token')
    vi.stubEnv('CAPSULE_ACCESS_COOKIE_SECRET', 'cookie-secret')

    expect(getCapsuleAccessConfig()).toEqual({
      inviteToken: 'invite-token',
      cookieSecret: 'cookie-secret',
    })
  })
})
