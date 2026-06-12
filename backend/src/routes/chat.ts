import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { streamSSE } from 'hono/streaming'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import { prisma } from '../db/client.js'
import { getDecryptedKey, getPreferredProvider } from './aiKeys.js'
import { buildSystemPrompt } from '../services/context.js'
import { ClaudeProvider } from '../services/ai/claude.js'
import { OpenAIProvider } from '../services/ai/openai.js'
import { GeminiProvider } from '../services/ai/gemini.js'
import type { AIProvider } from '../services/ai/provider.js'

const chat = new Hono<{ Variables: AuthVariables }>()
chat.use('*', requireAuth)

const sendSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  contextEntityId: z.string().optional(),
  contextEntityType: z.enum(['text', 'task']).optional(),
})

chat.get('/conversations', async (c) => {
  const userId = c.get('userId')
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, title: true, createdAt: true },
  })
  return c.json(conversations)
})

chat.get('/conversations/:id', async (c) => {
  const userId = c.get('userId')
  const conv = await prisma.conversation.findFirst({
    where: { id: c.req.param('id'), userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  if (!conv) return c.json({ error: 'Not found' }, 404)
  return c.json(conv)
})

chat.post('/', zValidator('json', sendSchema), async (c) => {
  const userId = c.get('userId')
  const { message, conversationId, contextEntityId, contextEntityType } = c.req.valid('json')

  // Resolve provider
  const provider = await getPreferredProvider(userId)
  if (!provider) return c.json({ error: 'No AI key configured. Add one in Settings.' }, 422)

  const apiKey = await getDecryptedKey(userId, provider)
  if (!apiKey) return c.json({ error: 'api_key_invalid' }, 422)

  let aiProvider: AIProvider
  if (provider === 'claude') aiProvider = new ClaudeProvider(apiKey)
  else if (provider === 'openai') aiProvider = new OpenAIProvider(apiKey)
  else aiProvider = new GeminiProvider(apiKey)

  // Get or create conversation
  let conv = conversationId
    ? await prisma.conversation.findFirst({ where: { id: conversationId, userId } })
    : null

  if (!conv) {
    conv = await prisma.conversation.create({
      data: { userId, title: message.slice(0, 60) },
    })
  }

  // Load history
  const history = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  // Save user message
  await prisma.message.create({
    data: { conversationId: conv.id, role: 'user', content: message },
  })

  const systemPrompt = await buildSystemPrompt(userId, contextEntityId, contextEntityType)

  const messages = [
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: message },
  ]

  return streamSSE(c, async (stream) => {
    let fullResponse = ''

    try {
      await stream.writeSSE({ data: JSON.stringify({ conversationId: conv!.id }), event: 'meta' })

      for await (const token of aiProvider.chat(messages, systemPrompt)) {
        fullResponse += token
        await stream.writeSSE({ data: JSON.stringify({ token }), event: 'token' })
      }

      await prisma.message.create({
        data: { conversationId: conv!.id, role: 'assistant', content: fullResponse },
      })

      await stream.writeSSE({ data: JSON.stringify({ done: true }), event: 'done' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI provider error'
      const isKeyError =
        msg.includes('401') || msg.includes('invalid') || msg.toLowerCase().includes('auth')
      await stream.writeSSE({
        data: JSON.stringify({ error: isKeyError ? 'api_key_invalid' : 'ai_error', message: msg }),
        event: 'error',
      })
    }
  })
})

export default chat
