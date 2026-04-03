// lib/validation/profile.ts
import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  college: z.string().min(2).max(100).optional().or(z.literal('')),
  department: z.string().min(2).max(100).optional().or(z.literal('')),
  year: z.string().optional().or(z.literal('')),
  bio: z.string().max(300).optional().or(z.literal('')),
  whatsappNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal('')),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
