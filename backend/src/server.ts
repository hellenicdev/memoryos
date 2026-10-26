import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import connectDB from './config/database'
import { corsOriginDelegate, resolveAllowedOrigins } from './config/cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

const allowedOrigins = resolveAllowedOrigins(process.env)

app.use(cors({
  origin: corsOriginDelegate(allowedOrigins),
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const start = async () => {
  await connectDB()

  const authRoutes = (await import('./routes/authRoutes')).default
  const memoryRoutes = (await import('./routes/memoryRoutes')).default
  const projectRoutes = (await import('./routes/projectRoutes')).default
  const aiRoutes = (await import('./routes/aiRoutes')).default
  const userRoutes = (await import('./routes/userRoutes')).default
  const notificationRoutes = (await import('./routes/notificationRoutes')).default
  const timelineRoutes = (await import('./routes/timelineRoutes')).default
  const knowledgeRoutes = (await import('./routes/knowledgeRoutes')).default
  const fileRoutes = (await import('./routes/fileRoutes')).default

  app.use('/api/auth', authRoutes)
  app.use('/api/memories', memoryRoutes)
  app.use('/api/projects', projectRoutes)
  app.use('/api/ai', aiRoutes)
  app.use('/api/user', userRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/timeline', timelineRoutes)
  app.use('/api/knowledge', knowledgeRoutes)
  app.use('/api/files', fileRoutes)

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err.message)
    const status = err.status || err.statusCode || 500
    res.status(status).json({
      success: false,
      message: err.message || 'Internal server error',
    })
  })

  app.listen(PORT, () => {
    console.log(`MemoryOS backend running on port ${PORT}`)
  })
}

start().catch(console.error)
