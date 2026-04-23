import { UnlockedCard } from './unlocked-card'
import { LockedCard } from './locked-card'
import { PostCard } from './post-card'

export type PostStatus = 'LOCKED' | 'UNLOCKED'

export type PostMedia = {
  id: string
  url: string
}

export type Post = {
  id: string
  title?: string
  description?: string
  mediaUrl: string
  media: PostMedia[]
  displayDate: string
  status?: PostStatus
  type: string
  author?: string
  unlockDate?: Date
}

export type MemoryCardProps = {
  post: Post
}

export function MemoryCard({ post }: MemoryCardProps) {
  if (!post.status) {
    return (
      <PostCard
        title={post.title}
        description={post.description}
        media={post.media}
        type={post.type}
        author={post.author}
      />
    )
  }

  if (post.status === 'LOCKED') {
    return (
      <LockedCard
        title={post.title}
        description={post.description}
        unlockDate={post.unlockDate}
      />
    )
  }

  return (
    <UnlockedCard
      title={post.title}
      description={post.description}
      mediaUrl={post.mediaUrl}
      link={`/capsules/${post.id}`}
    />
  )
}
