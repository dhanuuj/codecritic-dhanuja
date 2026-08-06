import { create } from 'zustand'
import { User } from '@/types'

interface UserStore {
  user: User | null              // The current user's data from our database
  isLoading: boolean             // True while fetching user data
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  updateKarma: (newKarma: number) => void  // Called after a review is submitted
  clearUser: () => void          // Called on logout
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  // Updates just the karma number without refetching the whole user
  updateKarma: (newKarma) =>
    set((state) => ({
      user: state.user ? { ...state.user, karma: newKarma } : null,
    })),

  clearUser: () => set({ user: null }),
}))