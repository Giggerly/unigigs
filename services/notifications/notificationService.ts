// services/notifications/notificationService.ts
import prisma from '@/lib/db/prisma'

export class NotificationService {
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) }
  }

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return { success: true }
  }

  async markRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    })
    return { success: true }
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } })
  }
}

export const notificationService = new NotificationService()
