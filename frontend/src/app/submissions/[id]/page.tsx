'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { GitBranch, Clock, User, Zap, MessageSquare, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { submissionsApi } from '@/lib/api'
import { useUserStore } from '@/store/userStore'
import { Submission } from '@/types'
import ReviewModal from '@/components/forms/ReviewModal'

export default function SubmissionDetailPage() {
  const { id } = useParams()
  const { isSignedIn } = useAuth()
  const { user } = useUserStore()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const response = await submissionsApi.getById(id as string) as { data: Submission }
        setSubmission(response.data)
      } catch (error) {
        toast.error('Failed to load submission')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubmission()
  }, [id])

  // Can the logged-in user review this submission?
  const canReview =
    isSignedIn &&
    submission &&
    user &&
    submission.authorId !== user.id

  // Has this user already reviewed it?
  const hasReviewed =
    submission?.reviews?.some((r) => r.reviewerId === user?.id)

  function handleReviewSuccess() {
    setShowReviewModal(false)
    // Refresh submission to show new review
    submissionsApi.getById(id as string)
      .then((res: any) => setSubmission(res.data))
    toast.success('Review submitted! +2 Karma earned')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 py-10 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-muted-foreground">Submission not found.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">Go home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-10">

        {/* Back button */}
        <Link href="/feed" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold leading-tight">
              {submission.title}
            </h1>
            <Badge variant={submission.status === 'REVIEWED' ? 'default' : 'secondary'}>
              {submission.status === 'REVIEWED' ? 'Reviewed' : 'Pending'}
            </Badge>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={submission.author.avatarUrl || ''} />
              <AvatarFallback className="text-xs">
                {submission.author.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* <span>{submission.author.username}</span> */}
            <Link
              href={`/profile/${submission.author.username}`}
              className="hover:underline"
            >
              {submission.author.username}
            </Link>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Zap className="h-3.5 w-3.5" />
              <span>{submission.author.karma} karma</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {submission.description}
                </p>
              </CardContent>
            </Card>

            {/* Review criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {submission.criteria.map((criterion, index) => (
                  <div
                    key={criterion.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{criterion.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">out of 10</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reviews section */}
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Reviews ({submission._count?.reviews || 0})
              </h2>

              {!submission.reviews || submission.reviews.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No reviews yet. Be the first to review this project.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submission.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={review.reviewer.avatarUrl || ''} />
                            <AvatarFallback className="text-xs">
                              {review.reviewer.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            {/* <p className="text-sm font-medium">{review.reviewer.username}</p> */}
                            <Link
                              href={`/profile/${review.reviewer.username}`}
                              className="text-sm font-medium hover:underline"
                            >
                              {review.reviewer.username}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="ml-auto flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Zap className="h-3 w-3" />
                            <span>{review.reviewer.karma}</span>
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
                                <span className="w-8 text-right font-medium">{rating.score}/10</span>
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

          {/* Sidebar */}
          <div className="space-y-4">

            {/* GitHub link */}
            <Card>
              <CardContent className="pt-6">
                <a
                  href={submission.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-md border p-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <GitBranch className="h-4 w-4" />
                  View on GitHub
                </a>
              </CardContent>
            </Card>

            {/* Tech tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {submission.techTags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review action */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                {!isSignedIn ? (
                  <div className="text-center">
                    <p className="mb-3 text-sm text-muted-foreground">
                      Sign in to submit a review
                    </p>
                    <Link href="/sign-in">
                      <Button className="w-full" variant="outline">Sign in</Button>
                    </Link>
                  </div>
                ) : hasReviewed ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      You have already reviewed this submission.
                    </p>
                  </div>
                ) : !canReview ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      This is your own submission.
                    </p>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Write a review
                  </Button>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  Earn +2 karma for each review
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Review modal */}
      {showReviewModal && submission && (
        <ReviewModal
          submission={submission as Submission}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}