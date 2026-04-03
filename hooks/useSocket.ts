// hooks/useSocket.ts
'use client'
import { useEffect, useRef } from 'react'
import { type Socket } from 'socket.io-client'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket/client'
import { useAuth } from './useAuth'

export function useSocket(): Socket | null {
  const { isAuthenticated } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    const socket = connectSocket()
    socketRef.current = socket

    return () => {
      // Don't disconnect on component unmount — maintain connection
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket()
    }
  }, [isAuthenticated])

  return isAuthenticated ? getSocket() : null
}
