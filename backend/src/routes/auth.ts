import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db/client.js'

const auth = new Hono()

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, name, password } = c.req.valid('json')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return c.json({ error: 'Email already registered' }, 409)

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true },
  })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  return c.json({ token, user }, 201)
})

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401)

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  return c.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

export default auth
