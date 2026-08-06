import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Code2, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/layout/Navbar'
import SubmissionCard from '@/components/cards/SubmissionCard'
import { Submission, PaginatedResponse } from '@/types'

// Fetch submissions on the server — no auth token needed for public feed
async function getSubmissions(): Promise<PaginatedResponse<Submission>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/submissions?page=1`,
      { cache: 'no-store' } // Always fresh data
    )
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch {
    return { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }
  }
}

export default async function HomePage() {
  // If user is already logged in, send them to the feed
  const { userId } = await auth()
  if (userId) {
    redirect('/feed')
  }

  const { data: submissions } = await getSubmissions()

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Code2 className="h-4 w-4" />
            Developer-focused code reviews
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Get real feedback on your code
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Submit your projects for peer review, give feedback to others,
            and earn karma for your contributions.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start for free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Users className="h-5 w-5 text-primary" />
                Peer
              </div>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Zap className="h-5 w-5 text-amber-500" />
                Karma
              </div>
              <p className="text-sm text-muted-foreground">System</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <Code2 className="h-5 w-5 text-green-500" />
                Open
              </div>
              <p className="text-sm text-muted-foreground">Platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest submissions — visible to everyone */}
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Latest review requests</h2>
            <Link href="/sign-in">
              <Button variant="outline" size="sm">Sign in to review</Button>
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Code2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                No submissions yet. Be the first to post a review request.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {submissions.map((submission: Submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}