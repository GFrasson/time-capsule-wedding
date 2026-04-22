import { describe, expect, it } from 'vitest'

import { cn, formatDateTime } from './utils'

describe('utils', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', false, 'px-4', ['text-sm'])).toBe('px-4 text-sm')
  })

  it('formats a date with both date and time information', () => {
    const result = formatDateTime(new Date(2025, 2, 15, 9, 30))

    expect(result).toMatch(/15\/03\/2025/)
    expect(result).toMatch(/09:30/)
  })
})
