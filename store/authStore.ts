'use client'
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  phone: string
  email?: string | null
  role: string
  status: string
  college?: string | null
  department?: string | null
  year?: string | null
  bio?: string | null
  profileImage?: string | null
  whatsappNumber?: string | null
  avgRating: number
  ratingCount: number
  completedGigs: number
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'campusgig-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
