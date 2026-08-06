import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import routes from './routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// For the Clerk webhook route we need the raw body
// so it must come before express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }))

app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeCritic backend is running' })
})

// All routes live under /api
app.use('/api', routes)

// 404 handler — catches any route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})