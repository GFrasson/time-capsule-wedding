import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { Lock, Unlock, Clock, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const capsuleCardVariants = tv({
  slots: {
    root: 'w-full rounded-xl transition-all duration-300 group',
    imageContainer: 'relative overflow-hidden',
    image: 'w-full h-full object-cover',
    overlay: 'absolute inset-0 flex flex-col items-center justify-center text-center p-6 backdrop-blur-[2px] z-10',
    badge: 'absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 z-10',
    badgeText: 'text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300',
    content: 'p-6',
    timer: 'flex gap-3 text-center',
    timerBox: 'bg-white dark:bg-neutral-rose-dark px-3 py-2 rounded shadow-sm min-w-[50px]',
    timerValue: 'text-primary font-bold text-lg',
    timerLabel: 'text-[10px] uppercase text-zinc-400 font-medium',
  },
  variants: {
    status: {
      LOCKED: {
        root: 'bg-neutral-rose/50 dark:bg-white/5 border border-dashed border-primary/30',
        badge: '',
        image: 'opacity-40 grayscale filter blur-sm',
      },
      UNLOCKED: {
        root: 'bg-white dark:bg-neutral-rose-dark shadow-lg border border-primary/5 hover:shadow-xl hover:border-primary/20 transform hover:-translate-y-1',
        badge: '',
        image: '',
      },
    },
  },
  defaultVariants: {
    status: 'LOCKED',
  },
})

export interface CapsuleCardProps extends React.ComponentProps<'div'>, VariantProps<typeof capsuleCardVariants> {
  title: string
  description?: string
  imageUrl: string
  unlockDate: Date
  videoCount?: number
  photoCount?: number
  onClick?: () => void
}

export function CapsuleCard({
  className,
  status = 'LOCKED',
  title,
  description,
  imageUrl,
  unlockDate,
  videoCount,
  onClick,
  ...props
}: CapsuleCardProps) {
  const { root, imageContainer, image, overlay, badge, badgeText, content, timer, timerBox, timerValue, timerLabel } = capsuleCardVariants({ status })

  // Simple countdown logic (mocked)
  const days = 245
  const hours = 12

  const isLocked = status === 'LOCKED'

  return (
    <div
      className={twMerge(root(), className)}
      onClick={isLocked ? undefined : onClick}
      data-slot="capsule-card"
      data-status={status}
      role={isLocked ? 'article' : 'button'}
      tabIndex={isLocked ? undefined : 0}
      onKeyDown={isLocked || !onClick ? undefined : (e) => e.key === 'Enter' && onClick()}
      {...props}
    >
      <div className={isLocked ? 'relative h-48' : 'relative h-48 sm:h-64'}>
        {/* Fixed heights based on design approximation */}
        <div className={imageContainer() + ' h-full'}>
          {/* Badge */}
          {isLocked ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-rose-dark shadow-sm flex items-center justify-center mb-4 text-primary">
                <Lock className="size-6" />
              </div>
              <h3 className="text-lg font-medium text-zinc-800 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{description}</p>

              <div className={timer()}>
                <div className={timerBox()}>
                  <div className={timerValue()}>{days}</div>
                  <div className={timerLabel()}>Days</div>
                </div>
                <div className={timerBox()}>
                  <div className={timerValue()}>{hours}</div>
                  <div className={timerLabel()}>Hrs</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={badge()}>
              <Unlock className="size-3 text-primary" />
              <span className={badgeText()}>Unlocked</span>
            </div>
          )}

          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Video className="size-10 text-white drop-shadow-lg" />
            </div>
          )}

          <img src={imageUrl} alt={title} className={image()} />
        </div>
      </div>

      {!isLocked && (
        <div className={content()}>
          <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2">{title}</h3>
          {description && <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{description}</p>}
        </div>
      )}
    </div>
  )
}
