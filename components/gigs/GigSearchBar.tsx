// components/gigs/GigSearchBar.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useFilterStore } from '@/store/filterStore'
import { cn } from '@/lib/utils'

export function GigSearchBar() {
  const { filters, setFilter } = useFilterStore()
  const [localValue, setLocalValue] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLocalValue(filters.search)
  }, [filters.search])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter('search', localValue)
    }, 380)
    return () => clearTimeout(debounceRef.current)
  }, [localValue, setFilter])

  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        inputMode="search"
        placeholder="Search gigs by title, keyword, or tag…"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={cn(
          'w-full h-11 pl-10 pr-9 rounded-xl border border-border bg-white text-sm shadow-soft',
          'transition-all duration-200 outline-none',
          'placeholder:text-muted-foreground',
          'focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 focus:shadow-card'
        )}
      />
      {localValue && (
        <button
          onClick={() => { setLocalValue(''); setFilter('search', '') }}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
