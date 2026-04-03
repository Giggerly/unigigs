// server.ts
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { verifyToken } from './lib/auth/jwt'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Track online users: userId -> socketId
const onlineUsers = new Map<string, string>()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie
          ?.split(';')
          .find((c: string) => c.trim().startsWith('campusgig-token='))
          ?.split('=')[1]

      if (!token) {
        return next(new Error('Authentication required'))
      }

      const payload = await verifyToken(token)
      if (!payload) {
        return next(new Error('Invalid token'))
      }

      socket.data.userId = payload.userId
      socket.data.user = payload
      next()
    } catch (err) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId
    console.log(`✅ Socket connected: ${userId}`)

    // Track online status
    onlineUsers.set(userId, socket.id)
    io.emit('user:online', { userId })

    // Join personal room for direct notifications
    socket.join(`user:${userId}`)

    // Join a conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`User ${userId} joined conversation ${conversationId}`)
    })

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // New message
    socket.on('message:send', async (data: {
      conversationId: string
      content: string
      type?: string
      offerPrice?: number
      offerETA?: string
    }) => {
      try {
        // Emit to all in conversation room
        io.to(`conversation:${data.conversationId}`).emit('message:new', {
          ...data,
          senderId: userId,
          createdAt: new Date().toISOString(),
          tempId: `temp-${Date.now()}`,
        })
      } catch (err) {
        console.error('Message emit error:', err)
        socket.emit('message:error', { message: 'Failed to send message' })
      }
    })

    // Typing indicator
    socket.on('typing:start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId })
    })

    socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId })
    })

    // Read receipts
    socket.on('message:read', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        userId,
        conversationId,
      })
    })

    // Offer actions
    socket.on('offer:respond', (data: {
      conversationId: string
      messageId: string
      status: 'accepted' | 'rejected'
    }) => {
      io.to(`conversation:${data.conversationId}`).emit('offer:response', {
        ...data,
        responderId: userId,
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(userId)
      io.emit('user:offline', { userId })
      console.log(`❌ Socket disconnected: ${userId}`)
    })
  })

  // Make io available globally for API routes
  ;(global as any).io = io

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`\n🚀 Unigigs running at http://${hostname}:${port}`)
      console.log(`📡 Socket.io server ready`)
      console.log(`🌿 Environment: ${dev ? 'development' : 'production'}\n`)
    })
})
