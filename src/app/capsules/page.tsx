import { CapsuleHeader } from '@/app/capsules/components/capsule-header'
import { Post } from '@/components/memory-card'
import { PostsTimeline } from '@/components/posts-timeline'

// Mock Data
const CAPSULES: Post[] = [
  {
    id: "1",
    status: 'UNLOCKED',
    title: 'The Proposal',
    description: 'The moment everything changed. Under the old oak tree where we had our first picnic. I was shaking so much I almost dropped the ring!',
    mediaUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop', // Wedding/Engagement photo
    displayDate: 'Oct 12, 2023',
    type: "image"
  },
  {
    id: "2",
    status: 'UNLOCKED',
    title: 'Just Married',
    description: 'Best day of our lives. The vows, the tears, the dancing. Here are the first 50 photos from the photographer.',
    mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2940&auto=format&fit=crop', // Wedding party
    displayDate: 'Jun 15, 2024',
    type: "image"
  },
  {
    id: "3",
    status: 'LOCKED',
    title: '1st Anniversary Capsule',
    description: 'Contains video messages from guests',
    mediaUrl: 'https://images.unsplash.com/photo-1511285560982-1351c4f63525?q=80&w=2940&auto=format&fit=crop', // Anniversary/Couple
    displayDate: 'Jun 15, 2025',
    type: "image"
  },
]

export default async function CapsulesPage() {
  // In a real app, fetch data here

  return (
    <div className="bg-zinc-50 min-h-screen">
      <main className="container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
        <CapsuleHeader
          coupleNames="Débora & Joel"
          weddingDate="September 12, 2023"
          daysCount={345}
          capsulesCount={12}
          momentsCount={89}
          backgroundImageUrl="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop"
        />

        <PostsTimeline posts={CAPSULES} />
      </main>
    </div>
  )
}
