"use client"

import { MemoryCard, Post } from "@/components/memory-card"
import { TimelineItem, TimelineRoot } from "@/components/ui/timeline"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

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
  // const { id } = await params

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    const interval = setInterval(fetchPosts, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
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

  if (loading) {
    return <div className="flex justify-center p-8">
      <Loader2 className="animate-spin text-zinc-400" />
    </div>
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p>Nenhuma mensagem ainda. Seja o primeiro!</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <main className="container mx-auto px-4 pb-12 md:px-8 max-w-3xl">
        <h1 className="mt-8 text-2xl text-center font-bold text-zinc-900 dark:text-white">Cápsula ...</h1>
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
      </main>
    </div>
  )
}
