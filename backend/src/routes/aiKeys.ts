import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import { prisma } from '../db/client.js'
import { encrypt, decrypt } from '../services/crypto.js'

const aiKeys = new Hono<{ Variables: AuthVariables }>()
aiKeys.use('*', requireAuth)

const PROVIDERS = ['claude', 'openai', 'gemini'] as const
type Provider = (typeof PROVIDERS)[number]

const saveKeySchema = z.object({ key: z.string().min(10) })

// GET /api/user/ai-keys — returns which providers are connected (never the key)
aiKeys.get('/', async (c) => {
  const userId = c.get('userId')
  const keys = await prisma.aIKey.findMany({ where: { userId } })

  const connected: Record<string, boolean> = { claude: false, openai: false, gemini: false }
  let preferred: string | null = null

  for (const k of keys) {
    connected[k.provider] = true
    if (k.preferred) preferred = k.provider
  }

  return c.json({ connected, preferred })
})

// PUT /api/user/ai-keys/:provider — save/update encrypted key
aiKeys.put('/:provider', zValidator('json', saveKeySchema), async (c) => {
  const userId = c.get('userId')
  const provider = c.req.param('provider') as Provider

  if (!PROVIDERS.includes(provider)) return c.json({ error: 'Unknown provider' }, 400)

  const { key } = c.req.valid('json')
  const encryptedKey = encrypt(key)

  await prisma.aIKey.upsert({
    where: { userId_provider: { userId, provider } },
    create: { userId, provider, encryptedKey, preferred: false },
    update: { encryptedKey },
  })

  return c.json({ provider, connected: true })
})

// PATCH /api/user/ai-keys/:provider/preferred — set as default provider
aiKeys.patch('/:provider/preferred', async (c) => {
  const userId = c.get('userId')
  const provider = c.req.param('provider') as Provider

  if (!PROVIDERS.includes(provider)) return c.json({ error: 'Unknown provider' }, 400)

  await prisma.aIKey.updateMany({ where: { userId }, data: { preferred: false } })
  await prisma.aIKey.update({
    where: { userId_provider: { userId, provider } },
    data: { preferred: true },
  })

  return c.json({ provider, preferred: true })
})

// DELETE /api/user/ai-keys/:provider
aiKeys.delete('/:provider', async (c) => {
  const userId = c.get('userId')
  const provider = c.req.param('provider') as Provider

  if (!PROVIDERS.includes(provider)) return c.json({ error: 'Unknown provider' }, 400)

  await prisma.aIKey.deleteMany({ where: { userId, provider } })
  return c.json({ provider, connected: false })
})

// Internal helper — used by chat route only
export async function getDecryptedKey(userId: string, provider: Provider): Promise<string | null> {
  const record = await prisma.aIKey.findUnique({ where: { userId_provider: { userId, provider } } })
  if (!record) return null
  return decrypt(record.encryptedKey)
}

export async function getPreferredProvider(userId: string): Promise<Provider | null> {
  const preferred = await prisma.aIKey.findFirst({ where: { userId, preferred: true } })
  if (preferred) return preferred.provider as Provider
  const any = await prisma.aIKey.findFirst({ where: { userId } })
  return any ? (any.provider as Provider) : null
}

export default aiKeys
