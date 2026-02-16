import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card"
import Image from "next/image"

interface PostCardProps {
  title?: string
  description?: string
  mediaUrl: string
  type: string
  author?: string
}

export function PostCard({ title, description, mediaUrl, type, author }: PostCardProps) {
  return (
    <Card
      className="w-full rounded-xl overflow-hidden transition-all duration-300 group p-0 gap-0 bg-white dark:bg-neutral-rose-dark shadow-lg border border-primary/5 hover:shadow-xl hover:border-primary/20 transform hover:-translate-y-1"
      role="button"
      tabIndex={0}
    >
      {type.includes('VIDEO') ? (
        <video
          controls
          className="w-full h-64 sm:h-80 object-cover overflow-hidden"
          src={mediaUrl}
        />
      ) : (
        <Image
          src={mediaUrl}
          alt={title || 'User upload'}
          className="w-full h-64 sm:h-80 object-cover overflow-hidden"
          width={1000}
          height={1000}
        />
      )}

      {
        title || description || author ? (
          <CardHeader className="p-4 text-left">
            <div className="flex justify-between items-center">
              {title && <CardTitle className="text-xl font-medium text-zinc-900 dark:text-white mb-1">{title}</CardTitle>}
              {author && <p className="text-xs text-zinc-400 mt-2 font-medium">{author}</p>}
            </div>
            {description && <CardDescription className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{description}</CardDescription>}
          </CardHeader>
        ) : null
      }
    </Card>
  )
}