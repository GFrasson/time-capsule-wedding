import prisma from '@/lib/prisma'

import { Post } from '@/components/memory-card'
import { HomeHeader } from '@/components/home-header'
import { PostsTimeline } from '@/components/posts-timeline'
import { PaginationControl } from '@/components/pagination-control'

export const dynamic = 'force-dynamic'

interface Capsule {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  unlockDate: Date;
}

async function getCapsules(page: number = 1, limit: number = 10): Promise<{ capsules: Post[], total: number }> {
  const skip = (page - 1) * limit

  const [capsules, total] = await Promise.all([
    prisma.capsule.findMany({
      orderBy: {
        unlockDate: 'asc',
      },
      skip,
      take: limit,
    }),
    prisma.capsule.count()
  ])

  const mappedCapsules: Post[] = capsules.map((capsule: Capsule) => ({
    id: capsule.id,
    title: capsule.title,
    description: capsule.description ?? '',
    status: new Date() < capsule.unlockDate ? 'LOCKED' : 'UNLOCKED',
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

  return { capsules: mappedCapsules, total }
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

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10

  const [{ capsules, total }, { firstCapsule, momentsCount }] = await Promise.all([
    getCapsules(currentPage, limit),
    getHeaderData(),
  ])

  const totalPages = Math.ceil(total / limit)

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
            capsulesCount={total}
            momentsCount={momentsCount}
            backgroundImageUrl="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop"
          />

          <PostsTimeline posts={capsules} />

          {totalPages > 1 && (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/"
              className="mt-8"
            />
          )}
        </main>
      </div>
    </main>
  )
}
