// hooks/useReviews.ts
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from './use-toast'

export function useReviews(userId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', userId],
    queryFn: async () => {
      if (!userId) return { reviews: [], distribution: {} }
      const res = await fetch(`/api/reviews/${userId}`)
      if (!res.ok) throw new Error('Failed to load reviews')
      return res.json()
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      gigId: string
      revieweeId: string
      rating: number
      comment?: string
    }) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit review')
      return json.review
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vars.revieweeId] })
      queryClient.invalidateQueries({ queryKey: ['profile', vars.revieweeId] })
      queryClient.invalidateQueries({ queryKey: ['gig', vars.gigId] })
      toast({ title: 'Review submitted! ⭐', variant: 'default' })
    },
    onError: (err: any) => {
      toast({ title: 'Review failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useSubmitReport() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit report')
      return json.report
    },
    onSuccess: () => {
      toast({ title: 'Report submitted', description: 'Our team will review it shortly.', variant: 'default' })
    },
    onError: (err: any) => {
      toast({ title: 'Report failed', description: err.message, variant: 'destructive' })
    },
  })
}
