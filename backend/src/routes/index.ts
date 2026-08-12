import { Router } from 'express'
import webhookRoutes from './webhooks'
import userRoutes from './users'
import submissionRoutes from './submissions'
import reviewRoutes from './reviews'
import authRoutes from './auth'

const router = Router()

router.use('/webhooks', webhookRoutes)
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/submissions', submissionRoutes)

// Mount reviews under BOTH paths:
// POST /api/submissions/:submissionId/reviews  ← frontend calls this
// GET  /api/reviews/given                      ← frontend calls this
// GET  /api/reviews/received                   ← frontend calls this
router.use('/submissions', reviewRoutes)
router.use('/reviews', reviewRoutes)

export default router