'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { reviewsApi } from '@/lib/api'
import { Submission } from '@/types'

interface ReviewModalProps {
  submission: Submission
  onClose: () => void
  onSuccess: () => void
}

const reviewSchema = z.object({
  strengths: z.string().min(10, 'Describe at least one strength'),
  improvements: z.string().min(10, 'Describe at least one improvement'),
  resources: z.string().optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

export default function ReviewModal({
  submission,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const { getToken } = useAuth()

  // Track ratings for each criterion separately
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(submission.criteria.map((c) => [c.id, 5]))
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  })

  function updateRating(criterionId: string, score: number) {
    setRatings((prev) => ({ ...prev, [criterionId]: score }))
  }

  async function onSubmit(data: ReviewFormData) {
    try {
      const token = await getToken()
      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const criterionRatings = submission.criteria.map((c) => ({
        criterionId: c.id,
        score: ratings[c.id] || 5,
      }))

      await reviewsApi.create(
        submission.id,
        {
          strengths: data.strengths,
          improvements: data.improvements,
          resources: data.resources || undefined,
          criterionRatings,
        },
        token
      )

      onSuccess()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit review'
      toast.error(message)
    }
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-background p-6 shadow-lg">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Write a review</h2>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {submission.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Criterion ratings */}
          <div className="space-y-4">
            <Label>Rate each criterion</Label>
            {submission.criteria.map((criterion) => (
              <div key={criterion.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{criterion.label}</span>
                  <span className="font-semibold text-primary">
                    {ratings[criterion.id]}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={ratings[criterion.id]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateRating(criterion.id, parseInt(e.target.value))
                  }
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 — needs work</span>
                  <span>10 — excellent</span>
                </div>
              </div>
            ))}
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label htmlFor="strengths">
              Strengths
              <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                — what was done well
              </span>
            </Label>
            <Textarea
              id="strengths"
              placeholder="e.g. Clean component structure, good use of TypeScript..."
              rows={3}
              {...register('strengths')}
            />
            {errors.strengths && (
              <p className="text-sm text-destructive">{errors.strengths.message}</p>
            )}
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="improvements">
              Areas for improvement
              <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                — constructive feedback
              </span>
            </Label>
            <Textarea
              id="improvements"
              placeholder="e.g. Error handling could be more robust, consider adding tests..."
              rows={3}
              {...register('improvements')}
            />
            {errors.improvements && (
              <p className="text-sm text-destructive">{errors.improvements.message}</p>
            )}
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <Label htmlFor="resources">
              Resources
              <span className="ml-1 text-xs text-muted-foreground">— optional</span>
            </Label>
            <Textarea
              id="resources"
              placeholder="Links, articles, or references that might help..."
              rows={2}
              {...register('resources')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit review (+2 karma)'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}