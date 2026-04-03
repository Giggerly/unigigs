// components/gigs/CategoryChips.tsx
'use client'
import { GIG_CATEGORIES } from '@/lib/constants'
import { useFilterStore } from '@/store/filterStore'
import { cn } from '@/lib/utils'

export function CategoryChips() {
  const { filters, setFilter } = useFilterStore()

  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* All */}
      <button
        onClick={() => setFilter('category', '')}
        className={cn(
          'flex-none inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border',
          !filters.category
            ? 'bg-brand-600 text-white border-brand-600 shadow-brand'
            : 'bg-white border-border text-muted-foreground hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50'
        )}
      >
        🏠 All
      </button>

      {GIG_CATEGORIES.map((cat) => {
        const isActive = filters.category === cat.value
        return (
          <button
            key={cat.value}
            onClick={() => setFilter('category', isActive ? '' : cat.value)}
            className={cn(
              'flex-none inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border',
              isActive
                ? 'bg-brand-600 text-white border-brand-600 shadow-brand'
                : 'bg-white border-border text-muted-foreground hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50'
            )}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
