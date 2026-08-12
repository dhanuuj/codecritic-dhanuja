import { Router, Request, Response } from 'express'
import { AuthenticatedRequest } from '../types'
import { requireAuth } from '../middleware/auth'
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

// GET /api/submissions — public feed
router.get('/', async (req: Request, res: Response) => {
  try {
    // Cast query params explicitly — Express types them as string | string[] | ParsedQs
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

    const submissions = await prisma.submission.findMany({
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
      skip,
      take: pageSize,
    })

    const total = await prisma.submission.count({ where })

    res.json({
      data: submissions,
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

// GET /api/submissions/my/list — must be BEFORE /:id or Express matches it as an id
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