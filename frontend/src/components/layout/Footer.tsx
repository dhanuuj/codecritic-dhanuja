import Link from 'next/link'
import { Code2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">CodeCritic</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/feed" className="hover:text-foreground transition-colors">
              Feed
            </Link>
            <Link href="/submit" className="hover:text-foreground transition-colors">
              Submit
            </Link>
          </div>

          {/* Credit */}
          <p className="text-xs text-muted-foreground">
            Built by Dhanuja Senarathna
          </p>

        </div>
      </div>
    </footer>
  )
}