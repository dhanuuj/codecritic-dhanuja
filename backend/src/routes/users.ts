import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../types'
import { requireAuth } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const router = Router()

// Schema for validating profile update data
const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()).max(20).optional(),
})

// GET /api/users/me — get the current logged-in user's profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
      include: {
        _count: {
          select: {
            submissions: true,
            reviews: true,
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json({ data: user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Failed to get user' })
  }
})

// GET /api/users/:username — get any user's public profile
router.get('/:username', async (req, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        bio: true,
        githubUrl: true,
        avatarUrl: true,
        karma: true,
        techStack: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
            reviews: true,
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json({ data: user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to get profile' })
  }
})

// PATCH /api/users/me — update the current user's profile
router.patch('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body)

    const user = await prisma.user.update({
      where: { clerkId: req.userId },
      data: validated,
    })

    res.json({ data: user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid data', errors: error.issues })
      return
    }
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

export default router