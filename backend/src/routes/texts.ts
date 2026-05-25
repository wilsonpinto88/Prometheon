import { Hono } from 'hono'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import { prisma } from '../db/client.js'

const texts = new Hono<{ Variables: AuthVariables }>()
texts.use('*', requireAuth)

texts.get('/', async (c) => {
  const items = await prisma.sacredText.findMany({ orderBy: { title: 'asc' } })
  return c.json(items)
})

texts.get('/:id', async (c) => {
  const item = await prisma.sacredText.findUnique({ where: { id: c.req.param('id') } })
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

export default texts
