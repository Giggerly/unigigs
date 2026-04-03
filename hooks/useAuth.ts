'use client'
// hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth() {
  const { user, setUser, setLoading, logout: storeLogout } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) return null
      const data = await res.json()
      return data.user
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    setLoading(isLoading)
    if (!isLoading) {
      setUser(data || null)
    }
  }, [data, isLoading, setUser, setLoading])

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      router.push('/login')
    },
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    logout: logoutMutation.mutate,
  }
}
