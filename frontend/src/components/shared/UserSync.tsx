'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useUserStore } from '@/store/userStore'
import { authApi } from '@/lib/api'
import { User } from '@/types'

// This component renders nothing visible — it just syncs
// the logged-in Clerk user with our database on every page load.
// It should be placed inside the (protected) layout.
export default function UserSync() {
  const { getToken, userId } = useAuth()
  const { setUser, setLoading } = useUserStore()

  useEffect(() => {
    if (!userId) return

    async function syncUser() {
      setLoading(true)
      try {
        const token = await getToken()
        if (!token) return

        const response = await authApi.sync(token) as { data: User }
        setUser(response.data)
      } catch (error) {
        console.error('Failed to sync user:', error)
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [userId])

  // Renders nothing — purely for side effects
  return null
}