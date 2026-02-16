import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: string | number | Date) {
  const d = new Date(date)
  return `${d.toLocaleDateString()} às ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}
