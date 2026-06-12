import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorMiddleware } from './middleware/error.js'
import authRoutes from './routes/auth.js'
import textsRoutes from './routes/texts.js'
import tasksRoutes from './routes/tasks.js'
import progressRoutes from './routes/progress.js'
import aiKeysRoutes from './routes/aiKeys.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: 'http://localhost:5173', credentials: true }))

app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.route('/auth', authRoutes)
app.route('/api/texts', textsRoutes)
app.route('/api/tasks', tasksRoutes)
app.route('/api/progress', progressRoutes)
app.route('/api/user/ai-keys', aiKeysRoutes)

app.onError(errorMiddleware)

serve({ fetch: app.fetch, port: 3001 }, () => {
  console.log('Backend running on http://localhost:3001')
})
