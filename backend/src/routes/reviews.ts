import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../types'
import { requireAuth } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const createReviewSchema = z.object({
  strengths: z.string().min(10),
  improvements: z.string().min(10),
  resources: z.string().optional(),
  criterionRatings: z.array(z.object({
    criterionId: z.string(),
    score: z.number().int().min(1).max(10),
  })).min(1),
})

// POST /api/submissions/:submissionId/reviews
router.post('/:submissionId/reviews', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.dbUserId) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const submissionId = req.params.submissionId as string
    const validated = createReviewSchema.parse(req.body)

    // Fetch submission with criteria — typed explicitly to avoid TS inference issues
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { criteria: true }
    })

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' })
      return
    }

    // Block self-review
    if (submission.authorId === req.dbUserId) {
      res.status(403).json({ message: 'You cannot review your own submission' })
      return
    }

    // Check all criteria are rated
    // submission.criteria is available because of include: { criteria: true }
    const criterionIds: string[] = submission.criteria.map((c) => c.id)
    const ratedIds: string[] = validated.criterionRatings.map((r) => r.criterionId)
    const missingRatings = criterionIds.filter((id) => !ratedIds.includes(id))

    if (missingRatings.length > 0) {
      res.status(400).json({
        message: 'All criteria must be rated',
        missing: missingRatings
      })
      return
    }

    // Create review + ratings + update status + award karma — all in one transaction
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          strengths: validated.strengths,
          improvements: validated.improvements,
          resources: validated.resources || null,
          submissionId,
          reviewerId: req.dbUserId!,
          criterionRatings: {
            create: validated.criterionRatings.map((r) => ({
              score: r.score,
              criterionId: r.criterionId,
            }))
          }
        },
        include: {
          criterionRatings: {
            include: { criterion: true }
          },
          reviewer: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            }
          }
        }
      })

      await tx.submission.update({
        where: { id: submissionId },
        data: { status: 'REVIEWED' }
      })

      await tx.user.update({
        where: { id: req.dbUserId },
        data: { karma: { increment: 2 } }
      })

      return newReview
    })

    res.status(201).json({ data: review })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid data', errors: error.issues })
      return
    }
    if ((error as any).code === 'P2002') {
      res.status(409).json({ message: 'You have already reviewed this submission' })
      return
    }
    console.error('Create review error:', error)
    res.status(500).json({ message: 'Failed to submit review' })
  }
})

// GET /api/reviews/given
router.get('/given', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.dbUserId) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const reviews = await prisma.review.findMany({
      where: { reviewerId: req.dbUserId },
      include: {
        submission: {
          select: {
            id: true,
            title: true,
            techTags: true,
            author: {
              select: { username: true, avatarUrl: true }
            }
          }
        },
        criterionRatings: {
          include: { criterion: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ data: reviews })
  } catch (error) {
    console.error('Get given reviews error:', error)
    res.status(500).json({ message: 'Failed to get reviews' })
  }
})

// GET /api/reviews/received
router.get('/received', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.dbUserId) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const reviews = await prisma.review.findMany({
      where: {
        submission: { authorId: req.dbUserId }
      },
      include: {
        submission: {
          select: {
            id: true,
            title: true,
            techTags: true,
          }
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            karma: true,
          }
        },
        criterionRatings: {
          include: { criterion: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ data: reviews })
  } catch (error) {
    console.error('Get received reviews error:', error)
    res.status(500).json({ message: 'Failed to get reviews' })
  }
})

export default router