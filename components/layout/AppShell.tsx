// components/layout/AppShell.tsx
'use client'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function AppShell({ children, className, fullWidth }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-1 flex flex-col">
      <Navbar />
      <main
        className={cn(
          'flex-1',
          !fullWidth && 'page-container pt-4 pb-24 sm:py-6 md:pb-8',
          className
        )}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
