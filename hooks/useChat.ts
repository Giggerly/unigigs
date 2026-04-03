// hooks/useChat.ts
'use client'
import { useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useChatStore } from '@/store/chatStore'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import { toast } from './use-toast'

// ─── Fetch conversations ────────────────────────────────────────────────────
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/chat/conversations')
      if (!res.ok) throw new Error('Failed to load conversations')
      const data = await res.json()
      return data.conversations
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ─── Fetch messages for a conversation ─────────────────────────────────────
export function useMessages(conversationId: string | null) {
  const { setMessages } = useChatStore()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []
      const res = await fetch(`/api/chat/messages/${conversationId}`)
      if (!res.ok) throw new Error('Failed to load messages')
      const data = await res.json()
      return data.messages
    },
    enabled: !!conversationId,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data && conversationId) {
      setMessages(conversationId, query.data)
    }
  }, [query.data, conversationId, setMessages])

  return query
}

// ─── Real-time socket events for a conversation ─────────────────────────────
export function useConversationSocket(conversationId: string | null) {
  const socket = useSocket()
  const { user } = useAuth()
  const { addMessage, setTyping, updateOfferStatus } = useChatStore()
  const queryClient = useQueryClient()
  const joinedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!socket || !conversationId) return

    // Avoid rejoining same room
    if (joinedRef.current !== conversationId) {
      if (joinedRef.current) {
        socket.emit('conversation:leave', joinedRef.current)
      }
      socket.emit('conversation:join', conversationId)
      joinedRef.current = conversationId
    }

    const handleNewMessage = (message: any) => {
      // Add the message regardless of sender — the store deduplicates
      // by checking if a matching tempId already exists
      addMessage(message)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      // Also invalidate messages so the persistent cache stays in sync
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    }

    const handleTypingStart = ({ userId }: { userId: string }) => {
      if (userId !== user?.id) setTyping(conversationId, userId, true)
    }

    const handleTypingStop = ({ userId }: { userId: string }) => {
      if (userId !== user?.id) setTyping(conversationId, userId, false)
    }

    const handleOfferResponse = ({ messageId, status }: any) => {
      updateOfferStatus(messageId, status)
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    }

    socket.on('message:new', handleNewMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)
    socket.on('offer:response', handleOfferResponse)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
      socket.off('offer:response', handleOfferResponse)
    }
  }, [socket, conversationId, user?.id, addMessage, setTyping, updateOfferStatus, queryClient])

  // Leave on unmount
  useEffect(() => {
    return () => {
      if (socket && joinedRef.current) {
        socket.emit('conversation:leave', joinedRef.current)
        joinedRef.current = null
      }
    }
  }, [socket])
}

// ─── Send a message ─────────────────────────────────────────────────────────
export function useSendMessage(conversationId: string) {
  const { addOptimisticMessage, updateMessage, markError } = useChatStore()
  const { user } = useAuth()
  const socket = useSocket()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      content,
      type = 'TEXT',
      offerPrice,
      offerETA,
      attachmentUrl,
      attachmentType,
    }: {
      content: string
      type?: string
      offerPrice?: number
      offerETA?: string
      attachmentUrl?: string
      attachmentType?: string
    }) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`

      // Optimistic update
      addOptimisticMessage({
        tempId,
        conversationId,
        senderId: user!.id,
        content,
        type,
        offerPrice,
        attachmentUrl,
        attachmentType,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: { id: user!.id, name: user!.name, profileImage: user?.profileImage },
      })

      // Also emit via socket for instant delivery
      if (socket?.connected) {
        socket.emit('message:send', { conversationId, content, type, offerPrice, offerETA, attachmentUrl, attachmentType })
      }

      try {
        const res = await fetch(`/api/chat/messages/${conversationId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, type, offerPrice, offerETA, attachmentUrl, attachmentType }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to send')

        updateMessage(tempId, json.message)
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
        return json.message
      } catch (err) {
        markError(tempId)
        throw err
      }
    },
    onError: (err: any) => {
      toast({ title: 'Message failed', description: err.message, variant: 'destructive' })
    },
  })
}

// ─── Typing indicator emitter ────────────────────────────────────────────────
export function useTypingEmitter(conversationId: string) {
  const socket = useSocket()
  const typingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const startTyping = useCallback(() => {
    if (!socket || typingRef.current) return
    typingRef.current = true
    socket.emit('typing:start', { conversationId })
  }, [socket, conversationId])

  const stopTyping = useCallback(() => {
    if (!socket || !typingRef.current) return
    typingRef.current = false
    socket.emit('typing:stop', { conversationId })
  }, [socket, conversationId])

  const onType = useCallback(() => {
    startTyping()
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(stopTyping, 2000)
  }, [startTyping, stopTyping])

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      stopTyping()
    }
  }, [stopTyping])

  return { onType, stopTyping }
}

// ─── Offer response ─────────────────────────────────────────────────────────
export function useOfferResponse(conversationId: string) {
  const { updateOfferStatus } = useChatStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, status }: { messageId: string; status: 'accepted' | 'rejected' }) => {
      const res = await fetch('/api/chat/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to respond')
      updateOfferStatus(messageId, status)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
    onError: (err: any) => {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' })
    },
  })
}
