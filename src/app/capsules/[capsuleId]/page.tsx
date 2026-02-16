import { MemoryCard, Post } from "@/components/memory-card"
import { FormattedDate } from "@/components/formatted-date"
import { TimelineItem, TimelineRoot } from "@/components/timeline"
import { Button } from "@/components/ui/button"
import { PlusCircle, QrCode } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { PaginationControl } from '@/components/pagination-control'

export const dynamic = 'force-dynamic'

interface CapsuleDetailPageProps {
  params: Promise<{ capsuleId: string }>
  searchParams: Promise<{ page?: string }>
}

interface Message {
  id: string;
  title: string | null;
  content: string | null;
  mediaUrl: string | null;
  createdAt: Date;
  type: string;
  sender: string | null;
}

export default async function CapsuleDetailPage({ params, searchParams }: CapsuleDetailPageProps) {
  const { capsuleId } = await params
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10
  const skip = (currentPage - 1) * limit

  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId }
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
    }),
    prisma.message.count({
      where: { capsuleId }
    })
  ])

  const totalPages = Math.ceil(totalMessages / limit)

  const posts: Post[] = messages.map((message: Message) => ({
    id: message.id,
    title: message.title ?? "",
    description: message.content ?? "",
    mediaUrl: message.mediaUrl ?? "",
    displayDate: message.createdAt.toISOString(),
    type: message.type,
    author: message.sender ?? "",
  }))

  return (
    <div className="bg-zinc-50 min-h-screen">
      <main className="bg-zinc-50 pt-8 container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
        <h1 className="text-2xl text-center font-bold text-zinc-900 dark:text-white">
          {capsule.title}
        </h1>

        <div className="flex justify-center items-center my-6">
          <Link href={`${capsuleId}/share`}>
            <Button variant="outline" className="gap-2 text-sm">
              <QrCode className="w-4 h-4" />
              QR Code
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
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

            {totalPages > 1 && (
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/capsules/${capsuleId}`}
                className="mt-8"
              />
            )}
          </>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-20">
        <Link href={`${capsuleId}/upload`}>
          <Button size="lg" className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105 flex items-center justify-center p-0">
            <PlusCircle className="w-12 h-12 text-white" />
            <span className="sr-only">Adicionar</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
