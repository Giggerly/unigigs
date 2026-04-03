// services/auth/profileService.ts
import prisma from '@/lib/db/prisma'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/profile'

export class ProfileService {
  async getProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
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
        reviewsReceived: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                college: true,
              },
            },
            gig: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            postedGigs: true,
            workerGigs: true,
            reviewsReceived: true,
          },
        },
      },
    })
    if (!user) throw new Error('User not found')
    return user
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const parsed = updateProfileSchema.safeParse(input)
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0].message)
    }

    const data = parsed.data

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      })
      if (existing) throw new Error('Email already in use')
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        email: data.email || null,
        college: data.college || null,
        department: data.department || null,
        year: data.year || null,
        bio: data.bio || null,
        whatsappNumber: data.whatsappNumber || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        college: true,
        department: true,
        year: true,
        bio: true,
        profileImage: true,
        whatsappNumber: true,
        avgRating: true,
        completedGigs: true,
      },
    })
    return user
  }

  async updateProfileImage(userId: string, imageUrl: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
      select: { id: true, profileImage: true },
    })
  }
}

export const profileService = new ProfileService()
