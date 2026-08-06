import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import UserSync from '@/components/shared/UserSync'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authResult = await auth()

  if (!authResult.userId) {
    redirect('/sign-in')
  }

  return (
    <>
      {/* UserSync runs on every authenticated page load */}
      <UserSync />
      {children}
    </>
  )
}