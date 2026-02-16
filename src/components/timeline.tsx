'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

type Message = {
  id: string
  sender: string
  content: string | null
  mediaUrl: string | null
  type: 'TEXT' | 'IMAGE' | 'VIDEO'
  createdAt: string
}

export function Timeline() {
  const [posts, setPosts] = useState<Message[]>([])
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
        const data = await res.json()
        setPosts(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-400" /></div>
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p>Nenhuma mensagem ainda. Seja o primeiro!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border-zinc-100">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 bg-zinc-50/50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
              ${post.type === 'IMAGE' ? 'bg-rose-400' : post.type === 'VIDEO' ? 'bg-blue-400' : 'bg-emerald-400'}
            `}>
              {post.sender.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base font-medium text-zinc-800">{post.sender}</CardTitle>
              <p className="text-xs text-zinc-400">{new Date(post.createdAt).toLocaleDateString()} às {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {post.mediaUrl && (
              <div className="w-full bg-black/5">
                {post.type.includes('VIDEO') ? (
                  <video controls className="w-full max-h-[500px] object-contain" src={post.mediaUrl} />
                ) : (
                  <img src={post.mediaUrl} alt="Content" className="w-full h-auto max-h-[600px] object-contain" loading="lazy" />
                )}
              </div>
            )}
            {post.content && (
              <div className="p-4">
                <p className="text-zinc-700 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
