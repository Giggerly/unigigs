// store/chatStore.ts
'use client'
import { create } from 'zustand'

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: string
  offerPrice?: number | null
  offerETA?: string | null
  offerStatus?: string | null
  attachmentUrl?: string | null
  attachmentType?: string | null
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    profileImage?: string | null
  }
  // temp client state
  isSending?: boolean
  isError?: boolean
  tempId?: string
}

export interface Conversation {
  id: string
  gigId: string
  gig: {
    id: string
    title: string
    budget: number
    status: string
    contactPref: string
    poster: {
      id: string
      name: string
      profileImage?: string | null
      whatsappNumber?: string | null
    }
  }
  participants: Array<{
    userId: string
    user: {
      id: string
      name: string
      profileImage?: string | null
      college?: string | null
      avgRating: number
      whatsappNumber?: string | null
    }
  }>
  messages?: ChatMessage[]
  lastMessageAt: string
  unreadCount?: number
  otherParticipant?: {
    userId: string
    user: {
      id: string
      name: string
      profileImage?: string | null
      college?: string | null
      avgRating: number
      whatsappNumber?: string | null
    }
  }
}

interface ChatState {
  // Messages per conversation
  messagesByConversation: Record<string, ChatMessage[]>
  // Typing indicators: conversationId -> Set of userIds typing
  typingUsers: Record<string, Set<string>>
  // Active conversation
  activeConversationId: string | null

  // Actions
  setMessages: (conversationId: string, messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (tempId: string, message: ChatMessage) => void
  markError: (tempId: string) => void
  updateOfferStatus: (messageId: string, status: string) => void
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void
  setActiveConversation: (id: string | null) => void
  addOptimisticMessage: (message: Omit<ChatMessage, 'id'> & { tempId: string }) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByConversation: {},
  typingUsers: {},
  activeConversationId: null,

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  addMessage: (message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] || []
      // Deduplicate by id or tempId
      const filtered = existing.filter(
        (m) => m.id !== message.id && m.tempId !== message.id
      )
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...filtered, message],
        },
      }
    }),

  addOptimisticMessage: (message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] || []
      const optimistic: ChatMessage = {
        ...message,
        id: message.tempId,
        isSending: true,
      }
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...existing, optimistic],
        },
      }
    }),

  updateMessage: (tempId, message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] || []
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: existing.map((m) =>
            m.tempId === tempId || m.id === tempId ? { ...message, isSending: false } : m
          ),
        },
      }
    }),

  markError: (tempId) =>
    set((state) => {
      const updated: Record<string, ChatMessage[]> = {}
      Object.entries(state.messagesByConversation).forEach(([convId, msgs]) => {
        updated[convId] = msgs.map((m) =>
          m.tempId === tempId ? { ...m, isSending: false, isError: true } : m
        )
      })
      return { messagesByConversation: updated }
    }),

  updateOfferStatus: (messageId, status) =>
    set((state) => {
      const updated: Record<string, ChatMessage[]> = {}
      Object.entries(state.messagesByConversation).forEach(([convId, msgs]) => {
        updated[convId] = msgs.map((m) =>
          m.id === messageId ? { ...m, offerStatus: status } : m
        )
      })
      return { messagesByConversation: updated }
    }),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const current = new Set(state.typingUsers[conversationId] || [])
      if (isTyping) current.add(userId)
      else current.delete(userId)
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: current },
      }
    }),

  setActiveConversation: (id) => set({ activeConversationId: id }),
}))
