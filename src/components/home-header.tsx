import * as React from 'react'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'

export interface HomeHeaderProps extends React.ComponentProps<'header'> {
  coupleNames: string
  weddingDate: string
  daysCount: number
  capsulesCount: number
  momentsCount: number
  backgroundImageUrl: string
}

export function HomeHeader({
  className,
  coupleNames,
  weddingDate,
  daysCount,
  capsulesCount,
  momentsCount,
  backgroundImageUrl,
  ...props
}: HomeHeaderProps) {
  return (
    <header
      className={twMerge('relative h-[450px] overflow-hidden rounded-b-xl group text-white', className)}
      {...props}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImageUrl}
          fill
          alt="Couple"
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30 z-10" />
      </div>

      <div className="absolute bottom-0 left-0 w-full z-20 text-center flex flex-col items-center gap-2 p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-xs font-medium uppercase tracking-widest mb-4">
          Est. {weddingDate}
        </div>

        <h1 className="text-4xl md:text-5xl font-light tracking-tight font-sans drop-shadow-lg">
          {coupleNames}
        </h1>

        <p className="text-white/90 text-sm font-medium tracking-widest uppercase opacity-80">
          Our Forever Timeline
        </p>

        <div className="flex justify-center mt-6 gap-6 text-white/80">
          <StatItem label="Days" value={daysCount} />
          <VerticalDivider />
          <StatItem label="Capsules" value={capsulesCount} />
          <VerticalDivider />
          <StatItem label="Moments" value={momentsCount} />
        </div>
      </div>
    </header>
  )
}

function StatItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
  )
}

function VerticalDivider() {
  return (
    <div className="w-px h-10 bg-white/20"></div>
  )
}
