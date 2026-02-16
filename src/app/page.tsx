import { Post, PostStatus } from '@/components/memory-card'
import { PrismaClient } from '@prisma/client'

import { HomeHeader } from '../components/home-header'
import { PostsTimeline } from '@/components/posts-timeline'

const prisma = new PrismaClient()

async function getCapsules(): Promise<Post[]> {
  const capsules = await prisma.capsule.findMany({
    orderBy: {
      unlockDate: 'asc',
    },
  })

  return capsules.map((capsule) => ({
    id: capsule.id,
    title: capsule.title,
    description: capsule.description ?? '',
    status: capsule.status as PostStatus,
    mediaUrl: capsule.coverUrl ?? '',
    displayDate: capsule.unlockDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }),
    type: 'image',
  }))
}


export default async function Home() {
  const capsules = await getCapsules()

  return (
    <main className="min-h-screen bg-zinc-50 relative pb-20 font-sans">
      <div className="bg-zinc-50 min-h-screen">
        <main className="container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
          <HomeHeader
            coupleNames="Débora & Joel"
            weddingDate="September 12, 2023"
            daysCount={345}
            capsulesCount={capsules.length}
            momentsCount={89}
            backgroundImageUrl="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop"
          />

          <PostsTimeline posts={capsules} />
        </main>
      </div>
    </main>
  )
}
