import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'

const timelineVariants = tv({
  slots: {
    root: 'relative flex flex-col items-center w-full py-8',
    line: 'absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-full z-0',
    item: 'group relative flex w-full items-start justify-center',
    content: 'w-full flex flex-col',
    date: 'flex items-center justify-center rounded-full border border-primary/10 bg-white dark:bg-neutral-rose-dark px-4 py-1 text-xs font-semibold text-primary shadow-sm z-20 my-4',
  },
  variants: {
    side: {
      left: {
        item: 'flex-row-reverse',
        content: 'items-end text-right',
      },
      right: {
        item: 'flex-row',
        content: 'items-start text-left',
      },
    }
  },
  defaultVariants: {
    side: 'left',
  }
})

export interface TimelineProps extends React.ComponentProps<'div'> { }

export function TimelineRoot({ className, children, ...props }: TimelineProps) {
  const { root, line } = timelineVariants()
  return (
    <div data-slot="timeline" className={twMerge(root(), className)} {...props}>
      <div className={line()} aria-hidden="true" />
      {children}
    </div>
  )
}

export interface TimelineDateProps extends React.ComponentProps<'div'> { }

export function TimelineDate({ className, ...props }: TimelineDateProps) {
  const { date } = timelineVariants()
  return (
    <div data-slot="timeline-date" className={twMerge(date(), className)} {...props} />
  )
}

export interface TimelineItemProps extends React.ComponentProps<'div'>, VariantProps<typeof timelineVariants> {
  date?: React.ReactNode
}

export function TimelineItem({ className, side, children, date, ...props }: TimelineItemProps) {
  const { item, content } = timelineVariants({ side })

  return (
    <div className="flex flex-col w-full items-center">
      {date && <TimelineDate>{date}</TimelineDate>}

      <div data-slot="timeline-item" className={twMerge(item(), className)} {...props}>
        <div className={content()}>
          {children}
        </div>
      </div>
    </div>
  )
}
