import { create } from 'zustand'

interface FeedStore {
  searchQuery: string
  selectedTech: string
  currentPage: number
  setSearchQuery: (query: string) => void
  setSelectedTech: (tech: string) => void
  setPage: (page: number) => void
  clearFilters: () => void
}

export const useFeedStore = create<FeedStore>((set) => ({
  searchQuery: '',
  selectedTech: '',
  currentPage: 1,

  setSearchQuery: (searchQuery) =>
    set({ searchQuery, currentPage: 1 }), // Reset to page 1 on new search

  setSelectedTech: (selectedTech) =>
    set({ selectedTech, currentPage: 1 }),

  setPage: (currentPage) => set({ currentPage }),

  clearFilters: () =>
    set({ searchQuery: '', selectedTech: '', currentPage: 1 }),
}))