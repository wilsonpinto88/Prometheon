import { Hono } from 'hono'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import { prisma } from '../db/client.js'

const tasks = new Hono<{ Variables: AuthVariables }>()
tasks.use('*', requireAuth)

tasks.get('/', async (c) => {
  const items = await prisma.task.findMany({ orderBy: { realm: 'asc' } })
  return c.json(items)
})

tasks.get('/:id', async (c) => {
  const item = await prisma.task.findUnique({ where: { id: c.req.param('id') } })
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

export default tasks
