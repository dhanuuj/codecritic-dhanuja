'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Zap, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { reviewsApi } from '@/lib/api'
import { Review } from '@/types'
import { Button } from '@/components/ui/button'

export default function ReviewsGivenPage() {
  const { getToken } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const token = await getToken()
        if (!token) return
        const response = await reviewsApi.getGiven(token) as { data: Review[] }
        setReviews(response.data)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReviews()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Reviews given</h1>
          <p className="text-sm text-muted-foreground">
            Your contributions to the community
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No reviews given yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review others&apos; submissions to earn karma and help the community.
            </p>
            <Link href="/feed">
              <Button className="mt-4" size="sm">Browse submissions</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/submissions/${review.submissionId}`}
                        className="font-medium hover:underline"
                      >
                        {(review as unknown as { submission?: { title?: string; techTags?: string[] } }).submission?.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {(review as unknown as { submission?: { title?: string; techTags?: string[] } }).submission?.techTags?.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <Zap className="h-3 w-3" />
                        <span>+2 karma earned</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Criterion ratings */}
                  <div className="space-y-2">
                    {review.criterionRatings.map((rating) => (
                      <div key={rating.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{rating.criterion.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${rating.score * 10}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs font-medium">
                            {rating.score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t pt-3 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Strengths: </span>{review.strengths}</p>
                    <p><span className="font-medium text-foreground">Improvements: </span>{review.improvements}</p>
                    {review.resources && (
                      <p><span className="font-medium text-foreground">Resources: </span>{review.resources}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}