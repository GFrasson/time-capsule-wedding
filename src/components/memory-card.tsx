import { UnlockedCard } from "./unlocked-card"
import { LockedCard } from "./locked-card"
import { PostCard } from "./post-card"

export type Post = {
  id: string
  title: string
  description: string
  mediaUrl: string
  displayDate: string
  status?: 'LOCKED' | 'UNLOCKED'
  type: string
}

export type MemoryCardProps = {
  post: Post
}

export function MemoryCard({ post }: MemoryCardProps) {
  if (!post.status) {
    return <PostCard
      title={post.title}
      description={post.description}
      mediaUrl={post.mediaUrl}
      type={post.type}
    />
  }

  if (post.status === 'LOCKED') {
    return <LockedCard
      title={post.title}
      description={post.description}
    />
  }

  return <UnlockedCard
    title={post.title}
    description={post.description}
    mediaUrl={post.mediaUrl}
    link={`/capsules/${post.id}`}
  />
}