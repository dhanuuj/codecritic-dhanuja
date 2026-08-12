'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Star, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { reviewsApi } from '@/lib/api'
import { Review } from '@/types'

export default function ReviewsReceivedPage() {
  const { getToken } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const token = await getToken()
        if (!token) return
        const response = await reviewsApi.getReceived(token) as { data: Review[] }
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
          <h1 className="text-2xl font-semibold">Reviews received</h1>
          <p className="text-sm text-muted-foreground">
            Feedback from the community on your submissions
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
            <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once others review your submissions, their feedback will appear here.
            </p>
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
                        {(review as any).submission?.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={review.reviewer.avatarUrl || ''} />
                          <AvatarFallback className="text-xs">
                            {review.reviewer.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>by {review.reviewer.username}</span>
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Zap className="h-3 w-3" />
                          <span>{review.reviewer.karma}</span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
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
                          <span className="w-8 text-right font-medium text-xs">
                            {rating.score}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Written feedback */}
                  <div className="space-y-3 border-t pt-3">
                    <div>
                      <p className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
                        Strengths
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {review.strengths}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        Areas for improvement
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {review.improvements}
                      </p>
                    </div>
                    {review.resources && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                          Resources
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {review.resources}
                        </p>
                      </div>
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