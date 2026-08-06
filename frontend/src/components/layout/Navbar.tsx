'use client'

import Link from 'next/link'
import { useAuth, UserButton, SignInButton } from '@clerk/nextjs'
import { Code2, Plus, Zap, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const { user } = useUserStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">CodeCritic</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">Sign in</Button>
              </SignInButton>
              <Link href="/sign-up">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          ) : (
            <>
              {/* Karma display */}
              {user && (
                <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{user.karma}</span>
                </div>
              )}

              <Link href="/submit">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Submit
                </Button>
              </Link>

              <UserButton />
            </>
          )}
        </div>
      </div>
    </header>
  )
}