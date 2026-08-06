'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import SubmissionCard from '@/components/cards/SubmissionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { submissionsApi } from '@/lib/api'
import { useFeedStore } from '@/store/feedStore'
import { useUserStore } from '@/store/userStore'
import { Submission, PaginatedResponse } from '@/types'

// Common tech tags for the filter bar
const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Angular', 'TypeScript',
  'JavaScript', 'Node.js', 'Python', 'Java', 'Go',
  'PostgreSQL', 'MongoDB', 'Docker', 'AWS',
]

export default function FeedPage() {
  const { getToken } = useAuth()
  const { user } = useUserStore()
  const { searchQuery, selectedTech, currentPage, setSearchQuery, setSelectedTech, clearFilters } = useFeedStore()

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState(searchQuery)

  // Fetch submissions whenever filters change
  useEffect(() => {
    async function fetchSubmissions() {
      setIsLoading(true)
      try {
        const response = await submissionsApi.getAll({
          search: searchQuery || undefined,
          tech: selectedTech || undefined,
          page: currentPage,
        }) as PaginatedResponse<Submission>

        setSubmissions(response.data)
        setPagination({
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        })
      } catch (error) {
        console.error('Failed to fetch submissions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubmissions()
  }, [searchQuery, selectedTech, currentPage])

  // Debounce the search input so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue)
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue])

  const hasActiveFilters = searchQuery || selectedTech

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            {user ? `Welcome back, ${user.username}` : 'Review feed'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.techStack?.length
              ? `Showing submissions relevant to your stack`
              : 'Browse all review requests'}
          </p>
        </div>

        {/* Search and filter bar */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                className="pl-9"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tech filter pills */}
          <div className="flex flex-wrap gap-2">
            {TECH_OPTIONS.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(selectedTech === tech ? '' : tech)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTech === tech
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="mb-4 text-sm text-muted-foreground">
            {pagination.total} submission{pagination.total !== 1 ? 's' : ''}
            {hasActiveFilters ? ' found' : ' total'}
          </p>
        )}

        {/* Submissions grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <SlidersHorizontal className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No submissions found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to post a review request'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => useFeedStore.getState().setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pagination.totalPages}
              onClick={() => useFeedStore.getState().setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}