// services/chat/chatService.ts
import prisma from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

const CONVERSATION_INCLUDE = {
  gig: {
    select: {
      id: true,
      title: true,
      budget: true,
      status: true,
      contactPref: true,
      poster: {
        select: { id: true, name: true, profileImage: true, whatsappNumber: true },
      },
    },
  },
  participants: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          college: true,
          avgRating: true,
          whatsappNumber: true,
        },
      },
    },
  },
  messages: {
    take: 1,
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      content: true,
      type: true,
      createdAt: true,
      senderId: true,
      isRead: true,
    },
  },
} satisfies Prisma.ConversationInclude

export class ChatService {
  // Get all conversations for a user
  async getUserConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: CONVERSATION_INCLUDE,
      orderBy: { lastMessageAt: 'desc' },
    })

    // Annotate unread counts
    return Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        })
        const otherParticipant = conv.participants.find((p) => p.userId !== userId)
        return { ...conv, unreadCount, otherParticipant }
      })
    )
  }

  // Get or create a conversation for a gig between two users
  async getOrCreateConversation(gigId: string, initiatorId: string, participantId: string) {
    // Find existing conversation between these two for this gig
    const existing = await prisma.conversation.findFirst({
      where: {
        gigId,
        AND: [
          { participants: { some: { userId: initiatorId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: CONVERSATION_INCLUDE,
    })

    if (existing) return existing

    // Create new
    const conversation = await prisma.conversation.create({
      data: {
        gigId,
        participants: {
          create: [{ userId: initiatorId }, { userId: participantId }],
        },
      },
      include: CONVERSATION_INCLUDE,
    })

    return conversation
  }

  // Get conversation by ID with auth check
  async getConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        ...CONVERSATION_INCLUDE,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) throw new Error('Conversation not found')

    const isParticipant = conversation.participants.some((p) => p.userId === userId)
    if (!isParticipant) throw new Error('Not authorised to view this conversation')

    // Mark all messages from other person as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    })

    const otherParticipant = conversation.participants.find((p) => p.userId !== userId)
    return { ...conversation, otherParticipant }
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, userId: string, cursor?: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { participants: { select: { userId: true } } },
    })

    if (!conversation) throw new Error('Conversation not found')
    const isParticipant = conversation.participants.some((p) => p.userId === userId)
    if (!isParticipant) throw new Error('Not authorised')

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      take: 50,
    })

    // Mark as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    })

    return messages
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = 'TEXT',
    offerPrice?: number,
    offerETA?: string,
    attachmentUrl?: string,
    attachmentType?: string
  ) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    })

    if (!conversation) throw new Error('Conversation not found')
    const isParticipant = conversation.participants.some((p) => p.userId === senderId)
    if (!isParticipant) throw new Error('Not authorised')

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type: type as any,
        offerPrice,
        offerETA: offerETA ? new Date(offerETA) : undefined,
        offerStatus: (type === 'OFFER' || type === 'COUNTER_OFFER') ? 'pending' : undefined,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    })

    // Notify other participants
    const otherParticipants = conversation.participants.filter((p) => p.userId !== senderId)
    await prisma.notification.createMany({
      data: otherParticipants.map((p) => ({
        userId: p.userId,
        type: 'NEW_MESSAGE' as any,
        title: 'New message',
        body: type === 'TEXT' ? content.slice(0, 80)
          : type === 'OFFER' ? `New offer: ₹${offerPrice}`
          : type === 'COUNTER_OFFER' ? `Counter-offer: ₹${offerPrice}`
          : attachmentType === 'IMAGE' ? '📷 Image'
          : attachmentType === 'PDF' ? '📄 PDF'
          : content.slice(0, 80),
        link: `/messages/${conversationId}`,
      })),
    })

    return message
  }

  // Respond to an offer (accept/reject)
  async respondToOffer(messageId: string, userId: string, status: 'accepted' | 'rejected') {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
            gig: { select: { id: true, title: true, posterId: true } },
          },
        },
      },
    })

    if (!message) throw new Error('Message not found')
    if (message.senderId === userId) throw new Error('Cannot respond to your own offer')

    const isParticipant = message.conversation.participants.some((p) => p.userId === userId)
    if (!isParticipant) throw new Error('Not authorised')

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { offerStatus: status },
    })

    // If accepted, update gig status and send a system message
    if (status === 'accepted') {
      const gigId = message.conversation.gigId
      
      // Determine workerId: it's the sender of the original offer
      const workerId = message.senderId

      await prisma.$transaction([
        // Update Gig status and worker
        prisma.gig.update({
          where: { id: gigId },
          data: { status: 'IN_PROGRESS', workerId },
        }),
        // Update application status if it exists
        prisma.application.updateMany({
          where: { gigId, userId: workerId },
          data: { isSelected: true },
        }),
        // System message
        prisma.message.create({
          data: {
            conversationId: message.conversationId,
            senderId: userId,
            content: `✅ Offer of ₹${message.offerPrice?.toLocaleString() || 'negotiated price'} accepted! Gig is now IN PROGRESS.`,
            type: 'SYSTEM',
          },
        }),
        // Update conversation
        prisma.conversation.update({
          where: { id: message.conversationId },
          data: { lastMessageAt: new Date() },
        })
      ])

      // Notify the worker
      await prisma.notification.create({
        data: {
          userId: workerId,
          type: 'OFFER_ACCEPTED',
          title: 'Offer Accepted! 🎉',
          body: `Your offer for "${message.conversation.gig.title}" has been accepted.`,
          link: `/messages/${message.conversationId}`,
        },
      }).catch(() => {})
    }

    return updated
  }

  // Get unread message count
  async getUnreadCount(userId: string) {
    return prisma.message.count({
      where: {
        senderId: { not: userId },
        isRead: false,
        conversation: {
          participants: { some: { userId } },
        },
      },
    })
  }
}

export const chatService = new ChatService()
