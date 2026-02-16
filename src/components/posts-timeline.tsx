import { TimelineRoot, TimelineItem } from '@/components/timeline'
import { MemoryCard, Post } from './memory-card'

interface PostsTimelineProps {
  posts: Post[]
}

export function PostsTimeline({ posts }: PostsTimelineProps) {
  return (
    <TimelineRoot>
      {posts.map((post, index) => (
        <TimelineItem
          key={post.id}
          side={index % 2 === 0 ? 'right' : 'left'}
          date={post.displayDate}
        >
          <MemoryCard post={post} />
        </TimelineItem>
      ))}
    </TimelineRoot>
  )
}