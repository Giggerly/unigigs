// hooks/useGigs.ts
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFilterStore } from '@/store/filterStore'
import { buildQueryString } from '@/lib/utils'
import { toast } from './use-toast'

export function useGigs() {
  const { filters } = useFilterStore()

  return useQuery({
    queryKey: ['gigs', filters],
    queryFn: async () => {
      const qs = buildQueryString({
        search: filters.search,
        category: filters.category,
        sort: filters.sort,
        minBudget: filters.minBudget,
        maxBudget: filters.maxBudget,
        urgent: filters.urgent || undefined,
        negotiable: filters.negotiable || undefined,
        locationMode: filters.locationMode,
        page: filters.page,
      })
      const res = await fetch(`/api/gigs?${qs}`)
      if (!res.ok) throw new Error('Failed to fetch gigs')
      return res.json()
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useGig(id: string | undefined) {
  return useQuery({
    queryKey: ['gig', id],
    queryFn: async () => {
      if (!id) return null
      const res = await fetch(`/api/gigs/${id}`)
      if (!res.ok) throw new Error('Gig not found')
      const data = await res.json()
      return data.gig
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useMyGigs() {
  return useQuery({
    queryKey: ['my-gigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs/my-gigs')
      if (!res.ok) throw new Error('Failed to fetch your gigs')
      const data = await res.json()
      return data.gigs
    },
  })
}

export function useMyWork() {
  return useQuery({
    queryKey: ['my-work'],
    queryFn: async () => {
      const res = await fetch('/api/gigs/my-work')
      if (!res.ok) throw new Error('Failed to fetch work history')
      const data = await res.json()
      return data.applications
    },
  })
}

export function useCreateGig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create gig')
      return json.gig
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] })
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] })
      toast({ title: 'Gig posted! 🎉', description: 'Your gig is now live.', variant: 'default' })
    },
    onError: (err: any) => {
      toast({ title: 'Failed to post gig', description: err.message, variant: 'destructive' })
    },
  })
}

export function useUpdateGig(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/gigs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update gig')
      return json.gig
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', id] })
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] })
      toast({ title: 'Gig updated!' })
    },
    onError: (err: any) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteGig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/gigs/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete gig')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] })
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] })
      toast({ title: 'Gig deleted' })
    },
    onError: (err: any) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useApplyToGig(gigId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { message?: string; proposedPrice?: number; proposedETA?: string }) => {
      const res = await fetch(`/api/gigs/${gigId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to apply')
      return json.application
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      queryClient.invalidateQueries({ queryKey: ['my-work'] })
      toast({ title: 'Applied! ✅', description: 'The poster will be notified.' })
    },
    onError: (err: any) => {
      toast({ title: 'Application failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useUpdateGigStatus(gigId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/gigs/${gigId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update status')
      return json.gig
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] })
      queryClient.invalidateQueries({ queryKey: ['my-work'] })
    },
    onError: (err: any) => {
      toast({ title: 'Status update failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useSelectWorker(gigId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workerId: string) => {
      const res = await fetch(`/api/gigs/${gigId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to select worker')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] })
      toast({ title: 'Worker selected! 🎉', description: 'They have been notified.' })
    },
    onError: (err: any) => {
      toast({ title: 'Selection failed', description: err.message, variant: 'destructive' })
    },
  })
}
