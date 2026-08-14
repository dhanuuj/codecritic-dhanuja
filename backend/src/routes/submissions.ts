import { Router, Request, Response } from 'express'
import { AuthenticatedRequest } from '../types'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const createSubmissionSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20),
  githubUrl: z.string().url(),
  techTags: z.array(z.string()).min(1).max(10),
  criteria: z.array(z.string().min(1)).min(1).max(5),
})

// GET /api/submissions/my/list — current user's own submissions
// MUST be before /:id otherwise Express treats "my" as an id
router.get('/my/list', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.dbUserId) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const submissions = await prisma.submission.findMany({
      where: { authorId: req.dbUserId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            karma: true,
          }
        },
        criteria: true,
        _count: { select: { reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ data: submissions })
  } catch (error) {
    console.error('Get my submissions error:', error)
    res.status(500).json({ message: 'Failed to get your submissions' })
  }
})

// GET /api/submissions — public feed with optional recommendation scoring
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined
    const tech = req.query.tech as string | undefined
    const page = parseInt(req.query.page as string) || 1
    const pageSize = 10
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tech) {
      where.techTags = { has: tech }
    }

    // Fetch ALL matching submissions before scoring
    const allSubmissions = await prisma.submission.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            karma: true,
          }
        },
        criteria: true,
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = allSubmissions.length
    let orderedSubmissions = allSubmissions

    // If logged in, score and reorder the feed
    if (req.userId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: req.userId },
        select: {
          techStack: true,
          reviews: {
            include: {
              submission: {
                select: { techTags: true }
              }
            }
          }
        }
      })

      if (dbUser) {
        const userTechStack = dbUser.techStack || []

        // Build set of tags user has reviewed before
        const reviewedTags = new Set<string>()
        dbUser.reviews.forEach((review) => {
          review.submission.techTags.forEach((tag) => reviewedTags.add(tag))
        })

        // Score every submission
        const scored = allSubmissions.map((submission) => {
          let score = 0

          // 1. Tech stack match — +10 per matching tag
          const matchingTags = submission.techTags.filter((tag) =>
            userTechStack.includes(tag)
          )
          score += matchingTags.length * 10

          // 2. Recency bonus
          const ageInDays =
            (Date.now() - new Date(submission.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)

          if (ageInDays <= 7) {
            score += 5
          } else if (ageInDays <= 30) {
            score += 2
          }

          // 3. Review history bonus — +3 per tag user has reviewed before
          const reviewHistoryMatches = submission.techTags.filter((tag) =>
            reviewedTags.has(tag)
          )
          score += reviewHistoryMatches.length * 3

          return { submission, score }
        })

        scored.sort((a, b) => b.score - a.score)
        orderedSubmissions = scored.map((s) => s.submission)
      }
    }

    // Paginate AFTER scoring
    const paginatedSubmissions = orderedSubmissions.slice(skip, skip + pageSize)

    res.json({
      data: paginatedSubmissions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }
    })
  } catch (error) {
    console.error('Get submissions error:', error)
    res.status(500).json({ message: 'Failed to get submissions' })
  }
})

// GET /api/submissions/:id — single submission
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id as string },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            karma: true,
            techStack: true,
          }
        },
        criteria: true,
        reviews: {
          include: {
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
        },
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' })
      return
    }

    res.json({ data: submission })
  } catch (error) {
    console.error('Get submission error:', error)
    res.status(500).json({ message: 'Failed to get submission' })
  }
})

// POST /api/submissions — create submission
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.dbUserId) {
      res.status(404).json({ message: 'User not found in database. Please complete your profile.' })
      return
    }

    const validated = createSubmissionSchema.parse(req.body)

    const submission = await prisma.$transaction(async (tx) => {
      return await tx.submission.create({
        data: {
          title: validated.title,
          description: validated.description,
          githubUrl: validated.githubUrl,
          techTags: validated.techTags,
          authorId: req.dbUserId!,
          criteria: {
            create: validated.criteria.map((label) => ({ label }))
          }
        },
        include: {
          criteria: true,
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            }
          }
        }
      })
    })

    res.status(201).json({ data: submission })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid data', errors: error.issues })
      return
    }
    console.error('Create submission error:', error)
    res.status(500).json({ message: 'Failed to create submission' })
  }
})

export default router