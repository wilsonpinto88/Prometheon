import { createMiddleware } from 'hono/factory'
import jwt from 'jsonwebtoken'

export type AuthVariables = { userId: string }

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    c.set('userId', payload.userId)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})
