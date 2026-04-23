'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PostMedia } from './memory-card'

interface MessageImageCarouselProps {
  alt: string
  media: PostMedia[]
}

export function MessageImageCarousel({
  alt,
  media,
}: MessageImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeMedia = media[activeIndex]

  if (!activeMedia) {
    return null
  }

  const canNavigate = media.length > 1

  return (
    <div className="bg-zinc-100">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          key={activeMedia.id}
          src={activeMedia.url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          unoptimized
        />

        {canNavigate ? (
          <>
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="rounded-full bg-white/90 text-zinc-900 shadow-sm hover:bg-white"
                onClick={() =>
                  setActiveIndex((currentIndex) =>
                    currentIndex === 0 ? media.length - 1 : currentIndex - 1
                  )
                }
                aria-label="Imagem anterior"
              >
                <ChevronLeft />
              </Button>
            </div>

            <div className="absolute inset-y-0 right-3 flex items-center">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="rounded-full bg-white/90 text-zinc-900 shadow-sm hover:bg-white"
                onClick={() =>
                  setActiveIndex((currentIndex) =>
                    currentIndex === media.length - 1 ? 0 : currentIndex + 1
                  )
                }
                aria-label="Próxima imagem"
              >
                <ChevronRight />
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          {media.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                index === activeIndex ? 'bg-zinc-900' : 'bg-zinc-300'
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Mostrar imagem ${index + 1} de ${media.length}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
