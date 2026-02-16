import { TimelineRoot, TimelineItem } from '@/components/ui/timeline'
import { CapsuleHeader } from '@/app/capsules/components/capsule-header'
import Link from 'next/link'
import { LockedCapsuleCard } from '@/components/locked-capsule-card'
import { UnlockedCapsuleCard } from '@/components/unlocked-capsule-card'

// Mock Data
type Capsule = {
  id: string
  status: 'LOCKED' | 'UNLOCKED'
  title: string
  description: string
  unlockDate: Date
  imageUrl: string
  displayDate: string
  videoCount?: number
}

const CAPSULES: Capsule[] = [
  {
    id: '1',
    status: 'UNLOCKED',
    title: 'The Proposal',
    description: 'The moment everything changed. Under the old oak tree where we had our first picnic. I was shaking so much I almost dropped the ring!',
    unlockDate: new Date('2023-10-12'),
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop', // Wedding/Engagement photo
    displayDate: 'Oct 12, 2023',
  },
  {
    id: '2',
    status: 'UNLOCKED',
    title: 'Just Married',
    description: 'Best day of our lives. The vows, the tears, the dancing. Here are the first 50 photos from the photographer.',
    unlockDate: new Date('2024-06-15'),
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2940&auto=format&fit=crop', // Wedding party
    displayDate: 'Jun 15, 2024',
  },
  {
    id: '3',
    status: 'LOCKED',
    title: '1st Anniversary Capsule',
    description: 'Contains video messages from guests',
    unlockDate: new Date('2025-06-15'),
    imageUrl: 'https://images.unsplash.com/photo-1511285560982-1351c4f63525?q=80&w=2940&auto=format&fit=crop', // Anniversary/Couple
    displayDate: 'Jun 15, 2025',
    videoCount: 12,
  },
]

export default async function CapsulesPage() {
  // In a real app, fetch data here

  return (
    <div className="bg-zinc-50 min-h-screen">
      <main className="container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
        <CapsuleHeader
          coupleNames="Sophie & Jack"
          weddingDate="September 12, 2023"
          daysCount={345}
          capsulesCount={12}
          momentsCount={89}
          backgroundImageUrl="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop"
        />

        <TimelineRoot>
          {CAPSULES.map((capsule, index) => (
            <TimelineItem key={capsule.id} side={index % 2 === 0 ? 'right' : 'left'} date={capsule.displayDate}>
              {capsule.status === 'UNLOCKED' ? (
                <Link href={`/capsules/${capsule.id}`} className="block w-full transition-transform active:scale-95">
                  <UnlockedCapsuleCard
                    title={capsule.title}
                    description={capsule.description}
                    imageUrl={capsule.imageUrl}
                  />
                </Link>
              ) : (
                <LockedCapsuleCard
                  title={capsule.title}
                  description={capsule.description}
                  imageUrl={capsule.imageUrl}
                />
              )}
            </TimelineItem>
          ))}
        </TimelineRoot>
      </main>
    </div>
  )
}
