import { Post, PostStatus } from '@/components/memory-card'

import { HomeHeader } from '../components/home-header'
import { PostsTimeline } from '@/components/posts-timeline'

import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Capsule {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  coverUrl: string | null;
  unlockDate: Date;
}

async function getCapsules(): Promise<Post[]> {
  const capsules = await prisma.capsule.findMany({
    orderBy: {
      unlockDate: 'asc',
    },
  })

  return capsules.map((capsule: Capsule) => ({
    id: capsule.id,
    title: capsule.title,
    description: capsule.description ?? '',
    status: capsule.status as PostStatus ?? undefined,
    mediaUrl: capsule.coverUrl ?? '',
    displayDate: capsule.unlockDate.toLocaleDateString('pt-BR',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      }),
    type: 'image',
    unlockDate: capsule.unlockDate,
  }))
}


async function getHeaderData() {
  const [firstCapsule, momentsCount] = await Promise.all([
    prisma.capsule.findFirst({
      orderBy: {
        unlockDate: 'asc',
      },
    }),
    prisma.message.count(),
  ])

  return { firstCapsule, momentsCount }
}

export default async function Home() {
  const [capsules, { firstCapsule, momentsCount }] = await Promise.all([
    getCapsules(),
    getHeaderData(),
  ])

  const startDate = firstCapsule?.unlockDate || new Date()
  const daysCount = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const weddingDate = startDate.toLocaleDateString('pt-BR', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })

  return (
    <main className="min-h-screen bg-zinc-50 relative pb-20 font-sans">
      <div className="bg-zinc-50 min-h-screen">
        <main className="container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
          <HomeHeader
            coupleNames="Débora & Joel"
            weddingDate={weddingDate}
            daysCount={daysCount}
            capsulesCount={capsules.length}
            momentsCount={momentsCount}
            backgroundImageUrl="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop"
          />

          <PostsTimeline posts={capsules} />
        </main>
      </div>
    </main>
  )
}
