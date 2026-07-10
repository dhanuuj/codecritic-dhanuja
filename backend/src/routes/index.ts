import { Router } from 'express'
import webhookRoutes from './webhooks'
import userRoutes from './users'
import submissionRoutes from './submissions'
import reviewRoutes from './reviews'

const router = Router()

// Webhook route — Clerk calls this when users sign up
router.use('/webhooks', webhookRoutes)

// API routes
router.use('/users', userRoutes)
router.use('/submissions', submissionRoutes)
router.use('/reviews', reviewRoutes)

export default router