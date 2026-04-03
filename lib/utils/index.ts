// lib/utils/index.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isAfter, differenceInHours } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: Date | string, pattern = 'MMM d, yyyy'): string {
  return format(new Date(date), pattern)
}

export function isExpired(date: Date | string): boolean {
  return !isAfter(new Date(date), new Date())
}

export function isUrgentDeadline(date: Date | string): boolean {
  const hours = differenceInHours(new Date(date), new Date())
  return hours <= 24 && hours > 0
}

export function getDeadlineLabel(date: Date | string): string {
  const hours = differenceInHours(new Date(date), new Date())
  if (hours <= 0) return 'Expired'
  if (hours <= 2) return `${hours}h left`
  if (hours <= 24) return `${hours}h left`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `${days}d left`
  return format(new Date(date), 'MMM d')
}

export function truncate(str: string, length = 100): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatPhoneDisplay(phone: string): string {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
}

export function generateAvatarColor(seed: string): string {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-amber-500',
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      query.set(key, String(value))
    }
  })
  return query.toString()
}

export function parseQueryParams(searchParams: URLSearchParams) {
  return {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    urgent: searchParams.get('urgent') === 'true',
    negotiable: searchParams.get('negotiable') === 'true',
    locationMode: searchParams.get('locationMode') || '',
    page: parseInt(searchParams.get('page') || '1'),
  }
}

export function apiResponse(data: unknown, status = 200) {
  return Response.json(data, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
