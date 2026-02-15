import * as React from 'react'
import { twMerge } from 'tailwind-merge'
import { Camera, Calendar, Hourglass } from 'lucide-react'

export interface CapsuleHeaderProps extends React.ComponentProps<'header'> {
  coupleNames: string
  weddingDate: string
  daysCount: number
  capsulesCount: number
  momentsCount: number
  backgroundImageUrl: string
}

export function CapsuleHeader({
  className,
  coupleNames,
  weddingDate,
  daysCount,
  capsulesCount,
  momentsCount,
  backgroundImageUrl,
  ...props
}: CapsuleHeaderProps) {
  return (
    <header
      className={twMerge('relative flex flex-col items-center justify-center text-center text-white min-h-[500px] w-full overflow-hidden', className)}
      {...props}
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImageUrl}
          alt="Couple"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2 p-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 text-xs font-medium uppercase tracking-widest mb-4">
          Est. {weddingDate}
        </div>

        <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white drop-shadow-lg font-serif">
          {coupleNames}
        </h1>

        <p className="text-sm uppercase tracking-[0.2em] opacity-90 mt-2 mb-12">
          Our Forever Timeline
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 border-t border-white/20 pt-8 mt-4">
          <StatItem label="Days" value={daysCount} />
          <StatItem label="Capsules" value={capsulesCount} />
          <StatItem label="Moments" value={momentsCount} />
        </div>
      </div>
    </header>
  )
}

function StatItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold font-serif">{value}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-80">{label}</span>
    </div>
  )
}
