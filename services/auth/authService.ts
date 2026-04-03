// services/auth/authService.ts
import prisma from '@/lib/db/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/jwt'
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from '@/lib/validation/auth'

export class AuthService {
  async register(input: RegisterInput) {
    const parsed = registerSchema.safeParse(input)
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0].message)
    }

    const { name, phone, email, password, college, department, year } = parsed.data

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) throw new Error('Phone number already registered')

    if (email) {
      const emailExists = await prisma.user.findUnique({ where: { email } })
      if (emailExists) throw new Error('Email already in use')
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        passwordHash,
        college: college || null,
        department: department || null,
        year: year || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        college: true,
        department: true,
        year: true,
        profileImage: true,
        avgRating: true,
        completedGigs: true,
        createdAt: true,
      },
    })

    const token = await signToken({ userId: user.id, phone: user.phone, role: user.role })
    return { user, token }
  }

  async login(input: LoginInput) {
    const parsed = loginSchema.safeParse(input)
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0].message)
    }

    const { phone, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) throw new Error('Invalid phone number or password')

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      throw new Error('Your account has been suspended. Contact support.')
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) throw new Error('Invalid phone number or password')

    const token = await signToken({ userId: user.id, phone: user.phone, role: user.role })

    const { passwordHash, ...safeUser } = user
    return { user: safeUser, token }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        status: true,
        college: true,
        department: true,
        year: true,
        bio: true,
        profileImage: true,
        whatsappNumber: true,
        avgRating: true,
        ratingCount: true,
        completedGigs: true,
        responseTime: true,
        createdAt: true,
      },
    })
    if (!user) throw new Error('User not found')
    return user
  }
}

export const authService = new AuthService()
