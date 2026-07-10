import { Response, NextFunction } from 'express'
import { verifyToken } from '@clerk/backend'
import { AuthenticatedRequest } from '../types'
import { prisma } from '../lib/prisma'

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!
    })

    if (!payload || !payload.sub) {
      res.status(401).json({ message: 'Invalid token' })
      return
    }

    req.userId = payload.sub

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: payload.sub }
    })

    if (dbUser) {
      req.dbUserId = dbUser.id
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ message: 'Authentication failed' })
  }
}