import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency: string = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date | string, timezone: string = 'Australia/Sydney'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(dateObj, timezone, 'dd/MM/yyyy')
}

export function formatTime(date: Date | string, timezone: string = 'Australia/Sydney'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(dateObj, timezone, 'HH:mm')
}

export function formatDateTime(date: Date | string, timezone: string = 'Australia/Sydney'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(dateObj, timezone, 'dd/MM/yyyy HH:mm')
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

export function isAuctionActive(auction: { startTime: Date | string; endTime: Date | string; status: string }): boolean {
  const now = new Date()
  const startTime = typeof auction.startTime === 'string' ? new Date(auction.startTime) : auction.startTime
  const endTime = typeof auction.endTime === 'string' ? new Date(auction.endTime) : auction.endTime
  return (
    auction.status === 'active' &&
    isAfter(now, startTime) &&
    isBefore(now, endTime)
  )
}

export function getTimeRemaining(endTime: Date | string): string {
  const now = new Date()
  const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime
  const diff = endDate.getTime() - now.getTime()
  
  if (diff <= 0) {
    return 'Ended'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

