import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Unlock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UnlockedCardProps {
  title?: string
  description?: string
  mediaUrl?: string
  link: string
  onClick?: () => void
}

export function UnlockedCard({ title = 'Sem título', description = '', mediaUrl = '', link, onClick }: UnlockedCardProps) {
  return (
    <Link
      href={link}
      className="block w-full transition-transform active:scale-95"
    >
      <Card
        className="w-full rounded-xl overflow-hidden transition-all duration-300 group p-0 gap-0 bg-white dark:bg-neutral-rose-dark shadow-lg border border-primary/5 hover:shadow-xl hover:border-primary/20 transform hover:-translate-y-1"
        onClick={onClick}
        data-slot="capsule-card"
        data-status="unlocked"
        role="button"
        tabIndex={0}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      >
        <div className="relative h-48 sm:h-64">
          <div className="relative overflow-hidden h-full">
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 z-10">
              <Unlock className="size-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Unlocked</span>
            </div>

            <Image
              src={mediaUrl}
              alt={title}
              className="w-full h-full object-cover overflow-hidden"
              width={500}
              height={500}
            />
          </div>
        </div>

        <CardHeader className="p-6">
          <CardTitle className="text-xl font-medium text-zinc-900 dark:text-white mb-2">{title}</CardTitle>
          {description && <CardDescription className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{description}</CardDescription>}
        </CardHeader>
      </Card>
    </Link>
  )
}