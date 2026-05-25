import type { ErrorHandler } from 'hono'

export const errorMiddleware: ErrorHandler = (err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
}
