'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Zap, BookOpen, Star, GitBranch, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usersApi } from '@/lib/api'
import { useUserStore } from '@/store/userStore'
import { User } from '@/types'

export default function ProfilePage() {
  const { getToken } = useAuth()
  const { user: storeUser, setUser } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = await getToken()
        if (!token) return
        const response = await usersApi.getMe(token) as { data: User }
        setUser(response.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 py-10 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!storeUser) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-muted-foreground">Profile not found.</p>
          <Link href="/settings">
            <Button className="mt-4">Complete your profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Clean the GitHub URL for display
  const githubDisplay = storeUser.githubUrl
    ? storeUser.githubUrl.replace('https://github.com/', '')
    : null

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-10">

        {/* Profile header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20">
                <AvatarImage src={storeUser.avatarUrl || ''} />
                <AvatarFallback className="text-2xl">
                  {storeUser.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-semibold">{storeUser.username}</h1>
                <p className="text-sm text-muted-foreground">{storeUser.email}</p>

                {storeUser.bio && (
                  <p className="mt-2 text-sm">{storeUser.bio}</p>
                )}

                {storeUser.githubUrl && githubDisplay && (
                  <a
                    href={storeUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <GitBranch className="h-4 w-4" />
                    <span>{githubDisplay}</span>
                  </a>
                )}
              </div>

              <Link href="/settings">
                <Button variant="outline" size="sm">Edit profile</Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-500">
                  <Zap className="h-5 w-5" />
                  <span>{storeUser.karma}</span>
                </div>
                <p className="text-xs text-muted-foreground">Karma</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {storeUser._count?.submissions || 0}
                </div>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {storeUser._count?.reviews || 0}
                </div>
                <p className="text-xs text-muted-foreground">Reviews given</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech stack */}
        {storeUser.techStack && storeUser.techStack.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Tech stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {storeUser.techStack.map((tech: string) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick links */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/my-requests">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 pt-6">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">My requests</p>
                  <p className="text-xs text-muted-foreground">View your submissions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reviews-received">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 pt-6">
                <Star className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Reviews received</p>
                  <p className="text-xs text-muted-foreground">Feedback on your work</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reviews-given">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 pt-6">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Reviews given</p>
                  <p className="text-xs text-muted-foreground">Your contributions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  )
}