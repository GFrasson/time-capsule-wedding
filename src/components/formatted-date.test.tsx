import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormattedDate } from './formatted-date'

describe('FormattedDate', () => {
  it('renders the formatted date text', () => {
    render(<FormattedDate date={new Date(2025, 2, 15, 9, 30)} />)

    expect(screen.getByText(/15\/03\/2025/)).toBeInTheDocument()
    expect(screen.getByText(/09:30/)).toBeInTheDocument()
  })
})
