// components/admin/AnalyticsCard.tsx
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AnalyticsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
  alert?: boolean
}

export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-600',
  iconBg = 'bg-brand-50',
  trend,
  className,
  alert,
}: AnalyticsCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-5 shadow-soft transition-all duration-200 hover:shadow-card',
        alert ? 'border-red-100' : 'border-border',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className={cn(
            'text-3xl font-bold tracking-tight',
            alert ? 'text-red-600' : 'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.value > 0 ? 'text-emerald-600' : trend.value < 0 ? 'text-red-500' : 'text-muted-foreground'
            )}>
              {trend.value > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              {trend.label}
            </div>
          )}
        </div>
        <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </div>
  )
}
