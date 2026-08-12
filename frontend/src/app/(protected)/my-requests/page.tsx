'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import SubmissionCard from '@/components/cards/SubmissionCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { submissionsApi } from '@/lib/api'
import { Submission } from '@/types'

export default function MyRequestsPage() {
  const { getToken } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMySubmissions() {
      try {
        const token = await getToken()
        if (!token) return
        const response = await submissionsApi.getMine(token) as { data: Submission[] }
        setSubmissions(response.data)
      } catch (error) {
        console.error('Failed to fetch submissions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMySubmissions()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My review requests</h1>
            <p className="text-sm text-muted-foreground">
              Projects you have posted for review
            </p>
          </div>
          <Link href="/submit">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New request
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No requests yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Post your first review request to get feedback from the community.
            </p>
            <Link href="/submit">
              <Button className="mt-4" size="sm">
                Post a review request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}