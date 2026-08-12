'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, GitBranch } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { submissionsApi } from '@/lib/api'
import { TECH_OPTIONS } from '@/lib/constants'

// Validation schema — matches what the backend expects
const submitSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  githubUrl: z.string().url('Must be a valid URL'),
})

type SubmitFormData = z.infer<typeof submitSchema>

export default function SubmitPage() {
  const router = useRouter()
  const { getToken } = useAuth()

  // Selected tech tags
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Dynamic criteria list — starts with one empty criterion
  const [criteria, setCriteria] = useState<string[]>([''])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
  })

  // Toggle a tech tag on/off
  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // Add a new empty criterion (max 5)
  function addCriterion() {
    if (criteria.length >= 5) return
    setCriteria((prev) => [...prev, ''])
  }

  // Remove a criterion by index (min 1)
  function removeCriterion(index: number) {
    if (criteria.length <= 1) return
    setCriteria((prev) => prev.filter((_, i) => i !== index))
  }

  // Update a criterion label at a specific index
  function updateCriterion(index: number, value: string) {
    setCriteria((prev) => prev.map((c, i) => (i === index ? value : c)))
  }

  async function onSubmit(data: SubmitFormData) {
    // Validate tags
    if (selectedTags.length === 0) {
      toast.error('Select at least one technology')
      return
    }

    // Validate criteria — must all be filled
    const filledCriteria = criteria.filter((c) => c.trim().length > 0)
    if (filledCriteria.length === 0) {
      toast.error('Add at least one review criterion')
      return
    }

    try {
      const token = await getToken()
      if (!token) {
        toast.error('Not authenticated')
        return
      }

      await submissionsApi.create(
        {
          title: data.title,
          description: data.description,
          githubUrl: data.githubUrl,
          techTags: selectedTags,
          criteria: filledCriteria,
        },
        token
      )

      toast.success('Review request posted!')
      router.push('/feed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to post review request')
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Post a review request</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your project and get structured feedback from other developers.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project title</Label>
            <Input
              id="title"
              placeholder="e.g. E-commerce checkout flow built with Next.js"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">What feedback are you looking for?</Label>
            <Textarea
              id="description"
              placeholder="Describe your project and what specific aspects you want reviewers to focus on..."
              rows={5}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub repository URL</Label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="githubUrl"
                placeholder="https://github.com/username/repo"
                className="pl-9"
                {...register('githubUrl')}
              />
            </div>
            {errors.githubUrl && (
              <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
            )}
          </div>

          {/* Tech tags */}
          <div className="space-y-3">
            <Label>Technologies used</Label>
            <p className="text-xs text-muted-foreground">
              Select all that apply — {selectedTags.length} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {TECH_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Review criteria */}
          <div className="space-y-3">
            <div>
              <Label>Review criteria</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Define 1–5 specific areas you want reviewers to rate out of 10.
                e.g. "Code Quality", "API Design", "Security"
              </p>
            </div>

            <div className="space-y-2">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Criterion ${index + 1} — e.g. Code Quality`}
                    value={criterion}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateCriterion(index, e.target.value)
                    }
                  />
                  {criteria.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCriterion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {criteria.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCriterion}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add criterion
              </Button>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post review request'}
          </Button>

        </form>
      </div>
    </div>
  )
}