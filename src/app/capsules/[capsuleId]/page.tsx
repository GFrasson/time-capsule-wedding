import { MemoryCard, Post } from "@/components/memory-card"
import { TimelineItem, TimelineRoot } from "@/components/timeline"
import { Button } from "@/components/ui/button"
import { PlusCircle, Share2 } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  sender: string
  content: string | null
  mediaUrl: string | null
  type: 'TEXT' | 'IMAGE' | 'VIDEO'
  createdAt: string
}

interface Capsule {
  id: string
  title: string
  description: string | null
}

interface CapsuleDetailPageProps {
  params: Promise<{ capsuleId: string }>
}

export default async function CapsuleDetailPage({ params }: CapsuleDetailPageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const { capsuleId } = await params

  const fetchCapsule = async (): Promise<Capsule | null> => {
    try {
      const res = await fetch(`${baseUrl}/api/capsules/${capsuleId}`)
      if (res.ok) {
        const data = await res.json()
        return data
      }
    } catch (error) {
      console.error("Failed to fetch capsule:", error)
    }
    return null
  }

  const fetchPosts = async (): Promise<Post[] | null> => {
    try {
      const res = await fetch(`${baseUrl}/api/capsules/${capsuleId}/posts`)
      if (res.ok) {
        const data: Message[] = await res.json()
        const posts: Post[] = data.map((message) => ({
          id: message.id,
          title: message.sender,
          description: message.content ?? '',
          mediaUrl: message.mediaUrl ?? '',
          displayDate: message.createdAt,
          type: message.type,
        }))

        return posts
      }
    } catch (error) {
      console.error(error)
    }
    return null
  }

  const capsule = await fetchCapsule()
  const posts = await fetchPosts()

  if (!capsule || !posts) {
    return <div className="flex justify-center p-8">Nenhuma mensagem encontrada. Seja o primeiro!</div>
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <main className="container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
        <h1 className="mt-8 text-2xl text-center font-bold text-zinc-900 dark:text-white">
          {capsule?.title ?? 'Cápsula'}
        </h1>

        <div className="flex justify-center my-6">
          <Link href={`${capsuleId}/share`}>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartilhar QR Code
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>Nenhuma mensagem ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <TimelineRoot>
            {posts.map((post) => (
              <TimelineItem
                key={post.id}
                side="left"
                date={`${new Date(post.displayDate).toLocaleDateString()} às ${new Date(post.displayDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              >
                <MemoryCard post={post} />
              </TimelineItem>
            ))}
          </TimelineRoot>
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
