'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { usersApi } from '@/lib/api'
import { useUserStore } from '@/store/userStore'
import { User } from '@/types'
import { useState } from 'react'
import { TECH_OPTIONS } from '@/lib/constants'

const settingsSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(30),
  bio: z.string().max(500).optional(),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { getToken } = useAuth()
  const { user, setUser } = useUserStore()
  const [selectedTech, setSelectedTech] = useState<string[]>(
    () => user?.techStack || []
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
      githubUrl: user?.githubUrl || '',
    },
  })

  // useEffect(() => {
  //   if (user) {
  //     reset({
  //       username: user.username,
  //       bio: user.bio || '',
  //       githubUrl: user.githubUrl || '',
  //     })
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     setSelectedTech(user.techStack || [])
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user?.id])

  function toggleTech(tech: string) {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  async function onSubmit(data: SettingsFormData) {
    try {
      const token = await getToken()
      if (!token) return

      const response = await usersApi.updateMe(
        {
          username: data.username,
          bio: data.bio || undefined,
          githubUrl: data.githubUrl || undefined,
          techStack: selectedTech,
        },
        token
      ) as { data: User }

      setUser(response.data)
      toast.success('Profile updated')
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update profile'
        toast.error(message)
        return
      }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile information</CardTitle>
              <CardDescription>
                This is how other developers see you on CodeCritic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="your_username"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell the community a bit about yourself..."
                  rows={3}
                  {...register('bio')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/yourusername"
                  {...register('githubUrl')}
                />
                {errors.githubUrl && (
                  <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
                )}
              </div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tech stack</CardTitle>
              <CardDescription>
                Used to personalise your feed — select everything you work with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selectedTech.includes(tech)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-muted'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
              {selectedTech.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {selectedTech.length} selected
                </p>
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>

        </form>
      </div>
    </div>
  )
}