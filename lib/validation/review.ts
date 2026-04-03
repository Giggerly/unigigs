// lib/validation/review.ts
import { z } from 'zod'

export const createReviewSchema = z.object({
  gigId: z.string().cuid('Invalid gig ID'),
  revieweeId: z.string().cuid('Invalid user ID'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment too long')
    .optional()
    .or(z.literal('')),
})

export const reportSchema = z.object({
  reason: z.enum([
    'SCAM',
    'SPAM',
    'HARASSMENT',
    'INAPPROPRIATE_CONTENT',
    'UNPAID_WORK',
    'MISLEADING_PRICING',
    'FAKE_IDENTITY',
    'PROHIBITED_TASK',
    'ABUSE',
    'OTHER',
  ]),
  description: z.string().max(1000).optional().or(z.literal('')),
  targetType: z.enum(['GIG', 'USER', 'MESSAGE']),
  gigId: z.string().cuid().optional(),
  reportedUserId: z.string().cuid().optional(),
  messageId: z.string().cuid().optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type ReportInput = z.infer<typeof reportSchema>
