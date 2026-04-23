import Link from 'next/link'
import { PlusCircle, QrCode } from 'lucide-react'
import prisma from '@/lib/prisma'
import { getMediaAssetUrl } from '@/lib/media'
import { MemoryCard, Post } from '@/components/memory-card'
import { FormattedDate } from '@/components/formatted-date'
import { TimelineItem, TimelineRoot } from '@/components/timeline'
import { PaginationControl } from '@/components/pagination-control'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface CapsuleDetailPageProps {
  params: Promise<{ capsuleId: string }>
  searchParams: Promise<{ page?: string }>
}

interface MessageRecord {
  id: string
  title: string | null
  content: string | null
  createdAt: Date
  type: string
  sender: string | null
  assets: Array<{
    id: string
    storagePath: string
  }>
}

export default async function CapsuleDetailPage({
  params,
  searchParams,
}: CapsuleDetailPageProps) {
  const { capsuleId } = await params
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10
  const skip = (currentPage - 1) * limit

  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
  })

  if (!capsule) {
    return <div className="flex justify-center p-8">Cápsula não encontrada</div>
  }

  const [messages, totalMessages] = await Promise.all([
    prisma.message.findMany({
      where: { capsuleId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        assets: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    }),
    prisma.message.count({
      where: { capsuleId },
    }),
  ])

  const totalPages = Math.ceil(totalMessages / limit)

  const posts: Post[] = messages.map((message: MessageRecord) => {
    const media = message.assets.map((asset) => ({
      id: asset.id,
      url: getMediaAssetUrl(asset.storagePath),
    }))

    return {
      id: message.id,
      title: message.title ?? '',
      description: message.content ?? '',
      mediaUrl: media[0]?.url ?? '',
      media,
      displayDate: message.createdAt.toISOString(),
      type: message.type,
      author: message.sender ?? '',
    }
  })

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="container mx-auto max-w-3xl bg-zinc-50 px-4 pb-12 pt-8 md:px-8">
        <h1 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
          {capsule.title}
        </h1>

        <div className="my-6 flex items-center justify-center">
          <Link href={`${capsuleId}/share`}>
            <Button variant="outline" className="gap-2 text-sm">
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="py-12 text-center text-zinc-400">
            <p>Nenhuma mensagem ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <>
            <TimelineRoot>
              {posts.map((post) => (
                <TimelineItem
                  key={post.id}
                  side="left"
                  date={<FormattedDate date={post.displayDate} />}
                >
                  <MemoryCard post={post} />
                </TimelineItem>
              ))}
            </TimelineRoot>

            {totalPages > 1 ? (
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/capsules/${capsuleId}`}
                className="mt-8"
              />
            ) : null}
          </>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-20">
        <Link href={`${capsuleId}/upload`}>
          <Button
            size="lg"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary p-0 shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
          >
            <PlusCircle className="h-12 w-12 text-white" />
            <span className="sr-only">Adicionar</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
