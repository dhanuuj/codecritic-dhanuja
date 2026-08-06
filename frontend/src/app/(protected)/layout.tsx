import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authResult = await auth()

  if (!authResult.userId) {
    redirect('/sign-in')
  }

  return <>{children}</>
}