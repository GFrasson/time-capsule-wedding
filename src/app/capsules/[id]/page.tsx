import { MemoryCard, Post } from "@/components/memory-card"
import { TimelineItem, TimelineRoot } from "@/components/timeline"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, Share2 } from "lucide-react"
import { useState, useEffect, use } from "react"
import Link from "next/link"

interface Message {
  id: string
  sender: string
  content: string | null
  mediaUrl: string | null
  type: 'TEXT' | 'IMAGE' | 'VIDEO'
  createdAt: string
}

interface CapsuleDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CapsuleDetailPage({ params }: CapsuleDetailPageProps) {
  const { id } = use(params)

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [capsuleTitle, setCapsuleTitle] = useState('')

  useEffect(() => {
    fetchPosts()
    const interval = setInterval(fetchPosts, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [id])

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?capsuleId=${id}`)
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

        setPosts(posts)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // TODO: Fetch Capsule info properly. For now deriving from logic or separate fetch.
  // Ideally, I should fetch capsule info too.
  // Keeping it simple for now, focusing on messages.

  if (loading) {
    return <div className="flex justify-center p-8">
      <Loader2 className="animate-spin text-zinc-400" />
    </div>
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <main className="container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
        <h1 className="mt-8 text-2xl text-center font-bold text-zinc-900 dark:text-white">Cápsula</h1>

        <div className="flex justify-center my-6">
          <Link href={`/share/${id}`}>
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
        <Link href={`/${id}/upload`}>
          <Button size="lg" className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105 flex items-center justify-center p-0">
            <PlusCircle className="w-12 h-12 text-white" />
            <span className="sr-only">Adicionar</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
