import { Card } from "./ui/card"
import { twMerge } from "tailwind-merge"
import { Lock } from "lucide-react"

interface LockedCardProps {
  title?: string
  description?: string
  unlockDate?: Date
}

export function LockedCard({ title = 'Sem título', description = '', unlockDate }: LockedCardProps) {
  const calculateTimeLeft = () => {
    if (!unlockDate) return { days: 0, hours: 0 }

    const now = new Date()
    const diff = unlockDate.getTime() - now.getTime()

    if (diff <= 0) return { days: 0, hours: 0 }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return { days, hours }
  }

  const { days, hours } = calculateTimeLeft()

  return (
    <Card
      className={twMerge(
        "w-full rounded-xl transition-all duration-300 group p-0 gap-0",
        "bg-neutral-rose/50 dark:bg-white/5 border border-dashed border-primary/30"
      )}
      data-slot="capsule-card"
      data-status="locked"
      role="article"
    >
      <div className="relative h-48">
        <div className="relative overflow-hidden h-full">
          <div className="absolute rounded-full inset-0 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs">
            <div className="w-10 h-12 p-2 rounded-full bg-white dark:bg-neutral-rose-dark shadow-sm flex items-center justify-center mb-2 text-primary">
              <Lock className="size-4" />
            </div>

            <h3 className="text-lg font-medium text-zinc-800 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{description}</p>

            <div className="flex gap-3 text-center">
              <div className="bg-white dark:bg-neutral-rose-dark px-3 py-2 rounded shadow-sm min-w-14">
                <div className="text-primary font-bold text-lg">{days}</div>
                <div className="text-xs uppercase text-zinc-400 font-medium">Dias</div>
              </div>
              <div className="bg-white dark:bg-neutral-rose-dark px-3 py-2 rounded shadow-sm min-w-14">
                <div className="text-primary font-bold text-lg">{hours}</div>
                <div className="text-xs uppercase text-zinc-400 font-medium">Horas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}