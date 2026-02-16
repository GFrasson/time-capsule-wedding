"use client"

import { formatDateTime } from "@/lib/utils"

interface FormattedDateProps {
  date: string | Date | number
}

export function FormattedDate({ date }: FormattedDateProps) {
  return (
    <span suppressHydrationWarning>
      {formatDateTime(date)}
    </span>
  )
}
