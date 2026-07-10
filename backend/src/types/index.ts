import { Request } from 'express'

// When a request comes in with a valid Clerk token,
// we attach the userId to the request object.
// This type lets TypeScript know that field exists.
export interface AuthenticatedRequest extends Request {
  userId?: string    // The Clerk user ID from the verified token
  dbUserId?: string  // The matching ID from our own database
}