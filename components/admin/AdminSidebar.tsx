// components/admin/AdminSidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Flag, Users,
  BarChart3, AlertTriangle, ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/gigs', label: 'All Gigs', icon: FileText },
  { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { href: '/admin/flags', label: 'AI Flags', icon: Flag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">CampusGig</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && pathname !== '/admin'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-50 text-brand-700 border border-brand-100'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4.5 w-4.5', isActive ? 'text-brand-600' : '')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Back to app */}
      <div className="p-3 border-t border-border">
        <Link
          href="/gigs"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </aside>
  )
}
