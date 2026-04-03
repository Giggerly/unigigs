// components/gigs/GigSortSelect.tsx
'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFilterStore } from '@/store/filterStore'
import { SORT_OPTIONS } from '@/lib/constants'

export function GigSortSelect() {
  const { filters, setFilter } = useFilterStore()

  return (
    <Select
      value={filters.sort}
      onValueChange={(val) => setFilter('sort', val as any)}
    >
      <SelectTrigger className="h-9 w-auto min-w-[120px] max-w-[160px] text-xs bg-white shadow-soft px-3">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
