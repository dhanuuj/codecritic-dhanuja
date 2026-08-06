import { Router } from 'express'
import webhookRoutes from './webhooks'
import userRoutes from './users'
import submissionRoutes from './submissions'
import reviewRoutes from './reviews'
import authRoutes from './auth'

const router = Router()

// Webhook route — Clerk calls this when users sign up
router.use('/webhooks', webhookRoutes)

router.use('/auth', authRoutes)  

// API routes
router.use('/users', userRoutes)
router.use('/submissions', submissionRoutes)
router.use('/reviews', reviewRoutes)

export default router