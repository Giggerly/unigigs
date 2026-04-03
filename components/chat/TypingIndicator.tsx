// components/chat/TypingIndicator.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface TypingIndicatorProps {
  name?: string
  visible: boolean
}

export function TypingIndicator({ name, visible }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-end gap-2 px-4"
        >
          <div className="flex items-center gap-1.5 bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
            <span className="text-xs text-muted-foreground mr-1">{name || 'Someone'} is typing</span>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
