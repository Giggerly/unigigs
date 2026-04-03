// components/layout/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageSquare, Plus, Briefcase, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/gigs', label: 'Gigs', icon: Home },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/gigs/create', label: 'Post', icon: Plus, isAction: true },
  { href: '/my-work', label: 'My Work', icon: Briefcase },
  { href: '/profile/me', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const accumulatedDelta = useRef(0)
  const tickRef = useRef(false)
  // How many px of consistent scroll movement needed to toggle state
  const THRESHOLD = 40

  useEffect(() => {
    const handleScroll = () => {
      if (tickRef.current) return
      tickRef.current = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const diff = currentY - lastScrollY.current
        lastScrollY.current = currentY

        // Always show when near the top
        if (currentY < 10) {
          accumulatedDelta.current = 0
          setVisible(true)
          tickRef.current = false
          return
        }

        // Accumulate delta in same direction; reset on direction change
        if (diff > 0 && accumulatedDelta.current < 0) {
          accumulatedDelta.current = diff   // direction reversed downward
        } else if (diff < 0 && accumulatedDelta.current > 0) {
          accumulatedDelta.current = diff   // direction reversed upward
        } else {
          accumulatedDelta.current += diff
        }

        if (accumulatedDelta.current > THRESHOLD) {
          // Enough consistent downward movement — hide
          setVisible(false)
          accumulatedDelta.current = 0
        } else if (accumulatedDelta.current < -THRESHOLD) {
          // Enough consistent upward movement — show
          setVisible(true)
          accumulatedDelta.current = 0
        }

        tickRef.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Always show when at the very top
  useEffect(() => {
    if (window.scrollY < 10) setVisible(true)
  }, [pathname])

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          key="bottom-nav"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-border"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around px-2 pt-2 pb-1">
            {navItems.map((item) => {
              const profileHref = item.href === '/profile/me' ? `/profile/${user?.id}` : item.href
              const isActive =
                item.href === '/gigs'
                  ? pathname === '/gigs'
                  : pathname.startsWith(item.href)

              if (item.isAction) {
                return (
                  <Link key={item.href} href={item.href} className="flex flex-col items-center">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="h-12 w-12 rounded-2xl gradient-brand flex items-center justify-center shadow-brand"
                    >
                      <item.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </motion.div>
                  </Link>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={profileHref}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors min-w-[52px]',
                    isActive ? 'text-brand-600' : 'text-muted-foreground'
                  )}
                >
                  <div className="relative">
                    <item.icon
                      className={cn('h-5 w-5 transition-all', isActive ? 'stroke-brand-600' : '')}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-600"
                        transition={{ type: 'spring', bounce: 0.25 }}
                      />
                    )}
                  </div>
                  <span className={cn('text-[10px] font-medium', isActive ? 'text-brand-600' : 'text-muted-foreground')}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
