'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Zap, GitBranch, ArrowLeft, BookOpen, Star, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usersApi } from '@/lib/api'
import { User } from '@/types'

export default function PublicProfilePage() {
  const { username } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await usersApi.getByUsername(
          username as string
        ) as { data: User }
        setUser(response.data)
      } catch (error) {
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [username])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto max-w-3xl px-4 py-10 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-lg font-medium">User not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No user with the username &quot;{username}&quot; exists.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-4">Go home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const githubDisplay = user.githubUrl
    ? user.githubUrl.replace('https://github.com/', '')
    : null

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 py-10">

        {/* Back button */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Profile header card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl || ''} />
                <AvatarFallback className="text-2xl">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-semibold">{user.username}</h1>

                {user.bio && (
                  <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
                )}

                {user.githubUrl && githubDisplay && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <GitBranch className="h-4 w-4" />
                    <span>{githubDisplay}</span>
                  </a>
                )}

                <p className="mt-2 text-xs text-muted-foreground">
                  Member since{' '}
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-500">
                  <Zap className="h-5 w-5" />
                  <span>{user.karma}</span>
                </div>
                <p className="text-xs text-muted-foreground">Karma</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {user._count?.submissions || 0}
                </div>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {user._count?.reviews || 0}
                </div>
                <p className="text-xs text-muted-foreground">Reviews given</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech stack */}
        {user.techStack && user.techStack.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Tech stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.techStack.map((tech: string) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contribution summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contribution summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <BookOpen className="h-8 w-8 text-primary opacity-80" />
                <div>
                  <p className="text-2xl font-bold">
                    {user._count?.submissions || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Review requests posted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <MessageSquare className="h-8 w-8 text-green-500 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">
                    {user._count?.reviews || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reviews contributed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Zap className="h-8 w-8 text-amber-500 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{user.karma}</p>
                  <p className="text-xs text-muted-foreground">
                    Total karma earned
                  </p>
                </div>
              </div>
            </div>

            {/* Most reviewed technologies derived from karma */}
            {user.techStack && user.techStack.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-sm font-medium">Stated expertise</p>
                <p className="text-sm text-muted-foreground">
                  Primarily works with{' '}
                  <span className="font-medium text-foreground">
                    {user.techStack.slice(0, 3).join(', ')}
                  </span>
                  {user.techStack.length > 3 && ` and ${user.techStack.length - 3} more`}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}