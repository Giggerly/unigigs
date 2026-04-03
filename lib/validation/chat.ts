// lib/validation/chat.ts
import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid(),
  content: z.string().min(1, 'Message cannot be empty').max(2000),
  type: z.enum(['TEXT', 'OFFER', 'COUNTER_OFFER']).default('TEXT'),
  offerPrice: z.number().positive().optional(),
  offerETA: z.string().min(1, 'Please specify a deadline'),
})

export const createConversationSchema = z.object({
  gigId: z.string().cuid(),
  participantId: z.string().cuid(),
  initialMessage: z.string().min(1).max(1000).optional(),
})

export const offerSchema = z.object({
  conversationId: z.string().cuid(),
  price: z.number().positive('Price must be positive'),
  eta: z.string().min(1, 'Please specify a deadline'),
  note: z.string().max(500).optional(),
  type: z.enum(['OFFER', 'COUNTER_OFFER']).default('OFFER'),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type OfferInput = z.infer<typeof offerSchema>
