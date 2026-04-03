// hooks/useProfile.ts
'use client'
import { useQuery } from '@tanstack/react-query'

export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) return null
      const res = await fetch(`/api/profile/${id}`)
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()
      return data.profile
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  })
}
