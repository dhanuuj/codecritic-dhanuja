import { clerkMiddleware } from '@clerk/nextjs/server'

// Next.js 16 uses proxy.ts instead of middleware.ts
// Route protection is now handled in individual layouts
// instead of here with createRouteMatcher
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}