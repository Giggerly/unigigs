// lib/validation/gig.ts
import { z } from 'zod'

export const createGigSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(120, 'Title too long (max 120 chars)'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description too long'),
  category: z.enum([
    'ACADEMIC_SUPPORT',
    'CAMPUS_ERRANDS',
    'CREATIVE_DIGITAL',
    'MARKETPLACE',
    'SERVICES',
    'OTHER',
  ]),
  budget: z
    .number({ invalid_type_error: 'Budget must be a number' })
    .min(1, 'Budget must be at least ₹1')
    .max(100000, 'Budget too high'),
  isNegotiable: z.boolean().default(false),
  deadline: z.string().refine((d) => new Date(d) > new Date(), {
    message: 'Deadline must be in the future',
  }),
  isUrgent: z.boolean().default(false),
  locationMode: z.enum(['ONLINE', 'ON_CAMPUS', 'FLEXIBLE']).default('ONLINE'),
  contactPref: z.enum(['IN_APP', 'WHATSAPP', 'BOTH']).default('IN_APP'),
  isRepeat: z.boolean().default(false),
  tags: z.array(z.string()).max(5).default([]),
})

export const updateGigSchema = createGigSchema.partial()

export const gigFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['newest', 'urgent', 'highest_paying', 'closing_soon']).default('newest'),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  urgent: z.coerce.boolean().optional(),
  negotiable: z.coerce.boolean().optional(),
  locationMode: z.enum(['ONLINE', 'ON_CAMPUS', 'FLEXIBLE']).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
})

export type CreateGigInput = z.infer<typeof createGigSchema>
export type UpdateGigInput = z.infer<typeof updateGigSchema>
export type GigFilterInput = z.infer<typeof gigFilterSchema>
