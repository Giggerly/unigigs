// components/layout/Navbar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, LogOut, User, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NotificationBell } from './NotificationBell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const pathname = usePathname()

  const navLinks = [
    { href: '/gigs', label: 'Browse' },
    { href: '/gigs/my-gigs', label: 'My Gigs' },
    { href: '/my-work', label: 'My Work' },
    { href: '/messages', label: 'Messages' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/gigs" className="flex items-center gap-2.5 group">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="Unigigs" className="h-8 w-8 object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:block">
            Uni<span className="text-brand-600">gigs</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== '/gigs')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200',
                  isActive
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-brand-50 -z-10"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Post gig CTA */}
          <Link href="/gigs/create">
            <Button size="sm" className="hidden sm:inline-flex gap-1.5">
              <Plus className="h-4 w-4" />
              Post Gig
            </Button>
          </Link>

          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage || ''} alt={user?.name} />
                  <AvatarFallback name={user?.name || 'U'} className="text-xs" />
                </Avatar>
                <span className="text-sm font-medium hidden sm:block max-w-24 truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.college || user?.phone}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user?.id}`} className="flex items-center gap-2 cursor-pointer rounded-xl">
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/edit" className="flex items-center gap-2 cursor-pointer rounded-xl">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer rounded-xl text-brand-600">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
