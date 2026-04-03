// components/gigs/GigFilters.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useFilterStore } from '@/store/filterStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { LOCATION_MODES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function GigFilters() {
  const [open, setOpen] = useState(false)
  const { filters, setFilter, setFilters, resetFilters, hasActiveFilters } = useFilterStore()
  const active = hasActiveFilters()

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'relative inline-flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 bg-white shadow-soft',
          active
            ? 'border-brand-400 text-brand-600 bg-brand-50'
            : 'border-border text-muted-foreground hover:border-brand-200 hover:text-brand-600'
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {active && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
            •
          </span>
        )}
      </button>

      {/* Drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-elevated flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h2 className="font-bold text-lg">Filters</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Narrow down your search</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-7">
                {/* Budget range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Budget Range (₹)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        min={0}
                        value={filters.minBudget}
                        onChange={(e) => setFilter('minBudget', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        type="number"
                        placeholder="Any"
                        min={0}
                        value={filters.maxBudget}
                        onChange={(e) => setFilter('maxBudget', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Quick budget presets */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: 'Under ₹200', max: '200' },
                      { label: '₹200–500', min: '200', max: '500' },
                      { label: '₹500–2K', min: '500', max: '2000' },
                      { label: 'Over ₹2K', min: '2000' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setFilters({ minBudget: preset.min || '', maxBudget: preset.max || '' })}
                        className={cn(
                          'text-xs px-3 py-1.5 rounded-lg border font-medium transition-all',
                          filters.minBudget === (preset.min || '') && filters.maxBudget === (preset.max || '')
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white border-border text-muted-foreground hover:border-brand-200 hover:text-brand-600'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Location</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFilter('locationMode', '')}
                      className={cn(
                        'py-2.5 rounded-xl border text-xs font-medium transition-all',
                        !filters.locationMode
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white border-border text-muted-foreground hover:border-brand-200'
                      )}
                    >
                      Any
                    </button>
                    {LOCATION_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setFilter('locationMode', filters.locationMode === mode.value ? '' : mode.value)}
                        className={cn(
                          'py-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1',
                          filters.locationMode === mode.value
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white border-border text-muted-foreground hover:border-brand-200'
                        )}
                      >
                        <span>{mode.icon}</span>
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle filters */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Options</Label>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-medium">Urgent Only</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Show deadline-critical gigs</p>
                    </div>
                    <Switch
                      checked={filters.urgent}
                      onCheckedChange={(val) => setFilter('urgent', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-medium">Negotiable Price</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Open to counter-offers</p>
                    </div>
                    <Switch
                      checked={filters.negotiable}
                      onCheckedChange={(val) => setFilter('negotiable', val)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="p-5 border-t border-border flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => { resetFilters(); setOpen(false) }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button className="flex-1" onClick={() => setOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
