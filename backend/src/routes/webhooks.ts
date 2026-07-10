import { Router, Request, Response } from 'express'
import { Webhook } from 'svix'
import { prisma } from '../lib/prisma'

const router = Router()

// Clerk sends webhook events with a raw body — we need
// express.raw() here instead of express.json()
router.post(
  '/clerk',
  async (req: Request, res: Response) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

    if (!webhookSecret) {
      res.status(500).json({ message: 'Webhook secret not configured' })
      return
    }

    // Get the Svix headers Clerk sends for verification
    const svixId = req.headers['svix-id'] as string
    const svixTimestamp = req.headers['svix-timestamp'] as string
    const svixSignature = req.headers['svix-signature'] as string

    if (!svixId || !svixTimestamp || !svixSignature) {
      res.status(400).json({ message: 'Missing svix headers' })
      return
    }

    // Verify the webhook is genuinely from Clerk
    const wh = new Webhook(webhookSecret)
    let event: any

    try {
      event = wh.verify(JSON.stringify(req.body), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (error) {
      res.status(400).json({ message: 'Invalid webhook signature' })
      return
    }

    // Handle different event types Clerk can send
    if (event.type === 'user.created') {
      const { id, email_addresses, username, image_url } = event.data

      const email = email_addresses?.[0]?.email_address

      if (!email) {
        res.status(400).json({ message: 'No email in webhook data' })
        return
      }

      // Create the user in our database
      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          username: username || email.split('@')[0],
          avatarUrl: image_url || null,
        }
      })

      console.log(`New user created in DB: ${email}`)
    }

    if (event.type === 'user.updated') {
      const { id, email_addresses, username, image_url } = event.data
      const email = email_addresses?.[0]?.email_address

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email || undefined,
          username: username || undefined,
          avatarUrl: image_url || undefined,
        }
      })
    }

    if (event.type === 'user.deleted') {
      const { id } = event.data
      await prisma.user.delete({
        where: { clerkId: id }
      }).catch(() => {
        // If user doesn't exist in our DB, that's fine
      })
    }

    res.status(200).json({ received: true })
  }
)

export default router