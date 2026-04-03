// lib/constants/index.ts

export const APP_NAME = 'CampusGig'
export const APP_TAGLINE = 'Campus work, done fast.'

export const GIG_CATEGORIES = [
  { value: 'ACADEMIC_SUPPORT', label: 'Academic Support', emoji: '📚', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { value: 'CAMPUS_ERRANDS', label: 'Campus Errands', emoji: '🏃', color: 'bg-green-50 text-green-700 border-green-100' },
  { value: 'CREATIVE_DIGITAL', label: 'Creative & Digital', emoji: '🎨', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { value: 'MARKETPLACE', label: 'Marketplace', emoji: '🛍️', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  { value: 'SERVICES', label: 'Services', emoji: '⚙️', color: 'bg-gray-50 text-gray-700 border-gray-100' },
  { value: 'OTHER', label: 'Other', emoji: '✨', color: 'bg-pink-50 text-pink-700 border-pink-100' },
] as const

export const GIG_STATUS_CONFIG = {
  POSTED: { label: 'Open', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-50 text-gray-600 border-gray-100' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' },
  EXPIRED: { label: 'Expired', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  DISPUTED: { label: 'Disputed', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
} as const

export const LOCATION_MODES = [
  { value: 'ONLINE', label: 'Online', icon: '🌐' },
  { value: 'ON_CAMPUS', label: 'On Campus', icon: '🏛️' },
  { value: 'FLEXIBLE', label: 'Flexible', icon: '📍' },
] as const

export const CONTACT_PREFERENCES = [
  { value: 'IN_APP', label: 'In-App Chat' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'BOTH', label: 'Both' },
] as const

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'urgent', label: 'Most Urgent' },
  { value: 'highest_paying', label: 'Highest Paying' },
  { value: 'closing_soon', label: 'Closing Soon' },
] as const

export const REPORT_REASONS = [
  { value: 'SCAM', label: 'Scam / Fraud' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
  { value: 'UNPAID_WORK', label: 'Unpaid Work' },
  { value: 'MISLEADING_PRICING', label: 'Misleading Pricing' },
  { value: 'FAKE_IDENTITY', label: 'Fake Identity' },
  { value: 'PROHIBITED_TASK', label: 'Prohibited Task' },
  { value: 'ABUSE', label: 'Abuse' },
  { value: 'OTHER', label: 'Other' },
] as const

export const COLLEGE_YEARS = [
  '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'PhD', 'Staff',
] as const

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf', 'text/plain']
