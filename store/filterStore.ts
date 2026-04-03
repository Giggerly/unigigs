// store/filterStore.ts
'use client'
import { create } from 'zustand'

export interface GigFilters {
  search: string
  category: string
  sort: 'newest' | 'urgent' | 'highest_paying' | 'closing_soon'
  minBudget: string
  maxBudget: string
  urgent: boolean
  negotiable: boolean
  locationMode: string
  page: number
}

const DEFAULT_FILTERS: GigFilters = {
  search: '',
  category: '',
  sort: 'newest',
  minBudget: '',
  maxBudget: '',
  urgent: false,
  negotiable: false,
  locationMode: '',
  page: 1,
}

interface FilterState {
  filters: GigFilters
  setFilter: <K extends keyof GigFilters>(key: K, value: GigFilters[K]) => void
  setFilters: (filters: Partial<GigFilters>) => void
  resetFilters: () => void
  hasActiveFilters: () => boolean
}

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: DEFAULT_FILTERS,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: key !== 'page' ? 1 : (value as number) },
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  hasActiveFilters: () => {
    const { filters } = get()
    return !!(
      filters.search ||
      filters.category ||
      filters.sort !== 'newest' ||
      filters.minBudget ||
      filters.maxBudget ||
      filters.urgent ||
      filters.negotiable ||
      filters.locationMode
    )
  },
}))
