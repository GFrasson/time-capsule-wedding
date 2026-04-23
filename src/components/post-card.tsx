import Image from 'next/image'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'
import { MessageImageCarousel } from './message-image-carousel'
import type { PostMedia } from './memory-card'

interface PostCardProps {
  title?: string
  description?: string
  media: PostMedia[]
  type: string
  author?: string
}

export function PostCard({
  title,
  description,
  media,
  type,
  author,
}: PostCardProps) {
  const primaryMedia = media[0]

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-primary/5 bg-white p-0 gap-0 shadow-lg transition-all duration-300 group hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl dark:bg-neutral-rose-dark">
      {type.includes('VIDEO') ? (
        primaryMedia ? (
          <video
            controls
            className="w-full h-auto overflow-hidden bg-black object-cover"
            src={primaryMedia.url}
          />
        ) : null
      ) : media.length > 1 ? (
        <MessageImageCarousel
          media={media}
          alt={title || 'User upload'}
        />
      ) : primaryMedia ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
          <Image
            src={primaryMedia.url}
            alt={title || 'User upload'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized
          />
        </div>
      ) : null}

      {title || description || author ? (
        <CardHeader className="p-4 text-left">
          <div className="flex items-center justify-between gap-4">
            {title ? (
              <CardTitle className="mb-1 text-xl font-medium text-zinc-900 dark:text-white">
                {title}
              </CardTitle>
            ) : null}
            {author ? (
              <p className="mt-2 text-xs font-medium text-zinc-400">{author}</p>
            ) : null}
          </div>
          {description ? (
            <CardDescription className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
    </Card>
  )
}
