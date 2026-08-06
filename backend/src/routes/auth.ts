import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../types'
import { requireAuth } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { createClerkClient } from '@clerk/backend'

const router = Router()

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!
})

// POST /api/auth/sync
// Called from the frontend after every sign-in.
// Creates the user in our database if they don't exist yet.
// If they already exist, just returns their data.
router.post('/sync', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Not authenticated' })
      return
    }

    // Check if user already exists in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: req.userId }
    })

    if (!user) {
      // Fetch the user's details from Clerk
      const clerkUser = await clerkClient.users.getUser(req.userId)

      const email = clerkUser.emailAddresses[0]?.emailAddress || ''
      const username = clerkUser.username ||
        email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 6)

      // Create them in our database
      user = await prisma.user.create({
        data: {
          clerkId: req.userId,
          email,
          username,
          avatarUrl: clerkUser.imageUrl || null,
        }
      })

      console.log(`New user synced to DB: ${email}`)
    }

    res.json({ data: user })
  } catch (error) {
    console.error('Sync error:', error)
    res.status(500).json({ message: 'Failed to sync user' })
  }
})

export default router