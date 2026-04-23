import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MessageImageCarousel } from './message-image-carousel'

describe('MessageImageCarousel', () => {
  it('renders only the active image and swaps it on navigation', async () => {
    const user = userEvent.setup()

    render(
      <MessageImageCarousel
        alt="Galeria"
        media={[
          { id: 'media-1', url: '/api/media?path=photo-1.jpg' },
          { id: 'media-2', url: '/api/media?path=photo-2.jpg' },
          { id: 'media-3', url: '/api/media?path=photo-3.jpg' },
        ]}
      />
    )

    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('photo-1.jpg')
    )

    await user.click(screen.getByLabelText('Próxima imagem'))

    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('photo-2.jpg')
    )
  })
})
