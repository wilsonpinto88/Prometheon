# Prometheon AI Agent + Frontend Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add BYOK AI key management, a streaming chat endpoint with learning-context injection, and a floating chat panel UI — then connect the frontend to the real backend, replacing all mock data.

**Architecture:** Backend adds crypto service (AES-256-GCM), AI provider abstraction (Claude/OpenAI/Gemini), context builder, and SSE chat route. Frontend replaces mock `api.ts` with real Axios calls, replaces mock `AuthContext` with JWT-backed auth, adds `chatStore`, `ChatPanel`, and `SettingsPage`.

**Tech Stack:** Backend additions: @anthropic-ai/sdk, openai, @google/generative-ai, dotenv. Frontend additions: minor changes to existing files + new chatStore + ChatPanel component.

**Assumptions:**
- Plan 1 (2026-05-25-backend-foundation.md) is fully complete and the backend runs on port 3001.
- User has at least one valid AI API key (Claude, OpenAI, or Gemini) for manual testing.
- PostgreSQL DB has the schema from Plan 1 applied.
- `.env` at workspace root has `KEY_SECRET` set (32+ chars).

---

## File Structure (additions to Plan 1)

```
backend/src/
├── services/
│   ├── crypto.ts               ← AES-256-GCM encrypt/decrypt
│   ├── context.ts              ← build system prompt from user progress
│   └── ai/
│       ├── provider.ts         ← AIProvider interface + ChatMessage type
│       ├── claude.ts           ← AnthropicProvider
│       ├── openai.ts           ← OpenAIProvider
│       └── gemini.ts           ← GeminiProvider
└── routes/
    ├── aiKeys.ts               ← PUT/GET/DELETE /api/user/ai-keys/:provider
    └── chat.ts                 ← POST /api/chat (SSE stream)

frontend/src/
├── services/
│   └── api.ts                  ← REPLACED: real Axios calls to backend
├── shared/
│   ├── contexts/
│   │   └── AuthContext.tsx     ← REPLACED: real JWT auth (login/register/logout)
│   └── store/
│       ├── progressStore.ts    ← MODIFIED: fetch from API instead of mock
│       └── chatStore.ts        ← NEW: open/close panel, conversations, messages
├── features/
│   └── chat/
│       ├── ChatPanel.tsx       ← NEW: floating chat UI
│       └── ChatMessage.tsx     ← NEW: single message bubble
└── pages/
    └── SettingsPage.tsx        ← NEW: AI key management UI
```

---

### Task 10: Crypto Service

**Files:**
- Create: `backend/src/services/crypto.ts`

- [ ] **Step 1: Create crypto.ts**

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const secret = process.env.KEY_SECRET
  if (!secret || secret.length < 32) throw new Error('KEY_SECRET must be 32+ chars')
  return Buffer.from(secret.slice(0, 32), 'utf8')
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv(12):tag(16):ciphertext — all hex
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

export function decrypt(stored: string): string {
  const [ivHex, tagHex, cipherHex] = stored.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const ciphertext = Buffer.from(cipherHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
```

- [ ] **Step 2: Verify encrypt/decrypt round-trip**

Create a quick test script and run it:

```bash
cd backend
node --input-type=module <<'EOF'
import { encrypt, decrypt } from './src/services/crypto.js'
process.env.KEY_SECRET = '12345678901234567890123456789012'
const e = encrypt('sk-test-key-abc123')
console.log('encrypted:', e)
console.log('decrypted:', decrypt(e))
EOF
```

Expected: `decrypted: sk-test-key-abc123`

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/crypto.ts
git commit -m "feat(backend): AES-256-GCM crypto service for AI key encryption"
```

---

### Task 11: AI Keys Routes

**Files:**
- Create: `backend/src/routes/aiKeys.ts`
- Modify: `backend/src/index.ts` — register route

- [ ] **Step 1: Create backend/src/routes/aiKeys.ts**

```typescript
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
```

- [ ] **Step 2: Register route in backend/src/index.ts**

```typescript
import aiKeysRoutes from './routes/aiKeys.js'
// ...
app.route('/api/user/ai-keys', aiKeysRoutes)
```

- [ ] **Step 3: Install AI SDK packages in backend**

```bash
cd backend && npm install @anthropic-ai/sdk openai @google/generative-ai
```

- [ ] **Step 4: Verify key storage**

```bash
TOKEN="eyJ..."

# Save a Claude key
curl -X PUT http://localhost:3001/api/user/ai-keys/claude \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"sk-ant-test-key-abc123"}'
# Expected: {"provider":"claude","connected":true}

# Check connected status
curl http://localhost:3001/api/user/ai-keys \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"connected":{"claude":true,"openai":false,"gemini":false},"preferred":null}

# Delete key
curl -X DELETE http://localhost:3001/api/user/ai-keys/claude \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"provider":"claude","connected":false}
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/aiKeys.ts backend/src/index.ts
git commit -m "feat(backend): BYOK AI key routes — encrypted store/retrieve/delete"
```

---

### Task 12: AI Provider Abstraction

**Files:**
- Create: `backend/src/services/ai/provider.ts`
- Create: `backend/src/services/ai/claude.ts`
- Create: `backend/src/services/ai/openai.ts`
- Create: `backend/src/services/ai/gemini.ts`

- [ ] **Step 1: Create provider.ts — shared interface**

```typescript
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIProvider {
  chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<string>
}
```

- [ ] **Step 2: Create claude.ts**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, ChatMessage } from './provider.js'

export class ClaudeProvider implements AIProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<string> {
    const stream = await this.client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text
      }
    }
  }
}
```

- [ ] **Step 3: Create openai.ts**

```typescript
import OpenAI from 'openai'
import type { AIProvider, ChatMessage } from './provider.js'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content
      if (text) yield text
    }
  }
}
```

- [ ] **Step 4: Create gemini.ts**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, ChatMessage } from './provider.js'

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async *chat(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<string> {
    const model = this.client.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: systemPrompt,
    })

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1].content

    const result = await chat.sendMessageStream(lastMessage)
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) yield text
    }
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/ai/
git commit -m "feat(backend): AIProvider abstraction — Claude, OpenAI, Gemini implementations"
```

---

### Task 13: Context Builder

**Files:**
- Create: `backend/src/services/context.ts`

- [ ] **Step 1: Create context.ts**

```typescript
import { prisma } from '../db/client.js'

export async function buildSystemPrompt(
  userId: string,
  contextEntityId?: string,
  contextEntityType?: 'text' | 'task'
): Promise<string> {
  const [user, taskProgress, textProgress] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.taskProgress.findMany({
      where: { userId, status: 'completed' },
      include: { task: true },
      orderBy: { completedAt: 'desc' },
      take: 3,
    }),
    prisma.textProgress.findMany({
      where: { userId, status: 'completed' },
      include: { text: true },
      orderBy: { completedAt: 'desc' },
      take: 3,
    }),
  ])

  const tasksCompleted = await prisma.taskProgress.count({ where: { userId, status: 'completed' } })
  const booksRead = await prisma.textProgress.count({ where: { userId, status: 'completed' } })
  const totalPoints = taskProgress.reduce((sum, tp) => sum + tp.pointsEarned, 0)

  let currentEntityContext = ''
  if (contextEntityId && contextEntityType === 'task') {
    const task = await prisma.task.findUnique({ where: { id: contextEntityId } })
    if (task) {
      currentEntityContext = `\nCurrently viewing task: "${task.title}" (${task.difficulty}, ${task.type}, ${task.points} pts)\n${task.description}`
    }
  } else if (contextEntityId && contextEntityType === 'text') {
    const text = await prisma.sacredText.findUnique({ where: { id: contextEntityId } })
    if (text) {
      currentEntityContext = `\nCurrently viewing book: "${text.title}" by ${text.author} (${text.difficulty}, ${text.chapters} chapters)\n${text.description}`
    }
  }

  const recentTasks = taskProgress.map((tp) => `- ${tp.task.title}`).join('\n') || 'None yet'
  const recentBooks = textProgress.map((tp) => `- ${tp.text.title}`).join('\n') || 'None yet'

  return `You are a study assistant for Prometheon, a learning platform themed around mythological realms.

User: ${user?.name ?? 'Learner'}
Progress: ${tasksCompleted} tasks completed, ${booksRead} books read, ${totalPoints} total points

Recently completed tasks:
${recentTasks}

Recently completed books:
${recentBooks}
${currentEntityContext}

Help the user understand, practice, and progress through their learning journey. Keep responses concise and actionable. Use examples relevant to software engineering when helpful.`
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/context.ts
git commit -m "feat(backend): context builder — builds AI system prompt from user progress"
```

---

### Task 14: Chat Route (SSE)

**Files:**
- Create: `backend/src/routes/chat.ts`
- Modify: `backend/src/index.ts` — register route

- [ ] **Step 1: Create backend/src/routes/chat.ts**

```typescript
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
```

- [ ] **Step 2: Register route in backend/src/index.ts**

```typescript
import chatRoutes from './routes/chat.js'
// ...
app.route('/api/chat', chatRoutes)
```

- [ ] **Step 3: Verify SSE stream with a real key**

```bash
TOKEN="eyJ..."
# First save a real key (use your actual key)
curl -X PUT http://localhost:3001/api/user/ai-keys/claude \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"YOUR_REAL_KEY"}'

curl -X POST http://localhost:3001/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message":"What is a binary search tree? One sentence only."}'
# Expected: stream of SSE events: meta → token (repeated) → done
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/chat.ts backend/src/index.ts
git commit -m "feat(backend): SSE chat route with context injection and conversation history"
```

---

### Task 15: Frontend — Replace Mock API

**Files:**
- Modify: `frontend/src/services/api.ts` — replace mock delays with real Axios calls

**Does NOT cover:** auth — that's Task 16.

- [ ] **Step 1: Rewrite frontend/src/services/api.ts**

```typescript
import axios from 'axios'

const client = axios.create({ baseURL: '/' })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const api = {
  async fetchTexts() {
    const { data } = await client.get('/api/texts')
    return data
  },

  async fetchTextById(id: string) {
    const { data } = await client.get(`/api/texts/${id}`)
    return data
  },

  async fetchTasks() {
    const { data } = await client.get('/api/tasks')
    return data
  },

  async fetchTaskById(id: string) {
    const { data } = await client.get(`/api/tasks/${id}`)
    return data
  },

  async updateTaskComplete(taskId: string) {
    const { data } = await client.patch(`/api/progress/tasks/${taskId}/complete`)
    return data
  },

  async fetchProgress() {
    const { data } = await client.get('/api/progress')
    return data
  },
}
```

- [ ] **Step 2: Verify the app loads texts from the real backend**

Start both servers:
```bash
# Terminal 1
cd backend && npx dotenv -e ../.env -- npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173 → log in (see Task 16) → navigate to Sacred Texts. Should show texts from DB, not mock data.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/api.ts
git commit -m "feat(frontend): replace mock api.ts with real Axios calls to backend"
```

---

### Task 16: Frontend — Real JWT Auth

**Files:**
- Modify: `frontend/src/shared/contexts/AuthContext.tsx` — real login/register/logout via backend

- [ ] **Step 1: Rewrite AuthContext.tsx**

```typescript
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const stored = localStorage.getItem('auth_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await axios.post('/auth/login', { email, password })
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const register = async (email: string, name: string, password: string) => {
    const { data } = await axios.post('/auth/register', { email, name, password })
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Verify login flow**

With both servers running, open http://localhost:5173. The Welcome page should show a login form (existing). Log in with the test user created in Task 6. Expected: redirected to Dashboard showing user's name from the real DB.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/contexts/AuthContext.tsx
git commit -m "feat(frontend): real JWT auth — login/register/logout backed by backend"
```

---

### Task 17: chatStore

**Files:**
- Create: `frontend/src/shared/store/chatStore.ts`

- [ ] **Step 1: Create chatStore.ts**

```typescript
import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface ChatState {
  isOpen: boolean
  conversationId: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  contextEntityId: string | undefined
  contextEntityType: 'text' | 'task' | undefined

  openChat: (entityId?: string, entityType?: 'text' | 'task') => void
  closeChat: () => void
  setError: (error: string | null) => void
  sendMessage: (content: string) => Promise<void>
  newConversation: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  conversationId: null,
  messages: [],
  isStreaming: false,
  error: null,
  contextEntityId: undefined,
  contextEntityType: undefined,

  openChat: (entityId, entityType) => {
    set({ isOpen: true, contextEntityId: entityId, contextEntityType: entityType })
  },

  closeChat: () => set({ isOpen: false }),

  setError: (error) => set({ error }),

  newConversation: () => set({ conversationId: null, messages: [], error: null }),

  sendMessage: async (content: string) => {
    const { conversationId, contextEntityId, contextEntityType, messages } = get()

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content }
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      streaming: true,
    }

    set({ messages: [...messages, userMsg, assistantMsg], isStreaming: true, error: null })

    const token = localStorage.getItem('auth_token')
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        message: content,
        conversationId: conversationId ?? undefined,
        contextEntityId,
        contextEntityType,
      }),
    })

    if (!res.ok || !res.body) {
      set((s) => ({
        messages: s.messages.slice(0, -1),
        isStreaming: false,
        error: 'Failed to reach AI. Check your API key in Settings.',
      }))
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const raw = line.slice(5).trim()
        try {
          const evt = JSON.parse(raw)

          if (evt.conversationId && !get().conversationId) {
            set({ conversationId: evt.conversationId })
          }

          if (evt.token) {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: m.content + evt.token } : m
              ),
            }))
          }

          if (evt.done) {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, streaming: false } : m
              ),
              isStreaming: false,
            }))
          }

          if (evt.error) {
            const msg =
              evt.error === 'api_key_invalid'
                ? 'Your API key is invalid. Update it in Settings.'
                : 'AI error. Try again.'
            set((s) => ({
              messages: s.messages.slice(0, -1),
              isStreaming: false,
              error: msg,
            }))
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
  },
}))
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/shared/store/chatStore.ts
git commit -m "feat(frontend): chatStore — SSE streaming, conversation tracking, error handling"
```

---

### Task 18: ChatPanel UI

**Files:**
- Create: `frontend/src/features/chat/ChatMessage.tsx`
- Create: `frontend/src/features/chat/ChatPanel.tsx`
- Modify: `frontend/src/shared/layout/Layout.tsx` — add ChatPanel + floating button

- [ ] **Step 1: Create ChatMessage.tsx**

```typescript
interface Props {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export default function ChatMessage({ role, content, streaming }: Props) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-gray-700 text-gray-100 rounded-bl-sm'
        }`}
      >
        {content || (streaming ? <span className="animate-pulse">▍</span> : null)}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ChatPanel.tsx**

```typescript
import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../shared/store/chatStore'
import ChatMessage from './ChatMessage'

export default function ChatPanel() {
  const {
    isOpen,
    closeChat,
    messages,
    isStreaming,
    error,
    setError,
    sendMessage,
    newConversation,
  } = useChatStore()

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed bottom-20 right-4 z-50 flex flex-col w-80 h-[520px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
      role="dialog"
      aria-label="AI Study Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-lg">⚡</span>
          <span className="text-white font-semibold text-sm">Study Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newConversation}
            className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            title="New conversation"
          >
            New
          </button>
          <button
            onClick={closeChat}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-xs text-center mt-8">
            Ask me anything about your current study material.
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            streaming={msg.streaming}
          />
        ))}
        {error && (
          <div
            role="alert"
            className="text-red-400 text-xs bg-red-900/30 rounded-lg px-3 py-2 mt-2 flex justify-between items-start"
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-white"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your study assistant..."
            rows={2}
            disabled={isStreaming}
            className="flex-1 bg-gray-700 text-white text-sm rounded-xl px-3 py-2 resize-none outline-none placeholder-gray-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            aria-label="Message input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="self-end bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add ChatPanel + floating button to Layout.tsx**

Read `frontend/src/shared/layout/Layout.tsx`, then add the imports and the floating button + panel before the closing `</div>` of the layout wrapper:

```typescript
import ChatPanel from '../../features/chat/ChatPanel'
import { useChatStore } from '../store/chatStore'

// Inside Layout component, before return's closing tag:
const { isOpen, openChat } = useChatStore()

// Add before the final </div>:
<>
  <button
    onClick={() => openChat()}
    className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-colors"
    aria-label="Open AI study assistant"
    title="AI Study Assistant"
  >
    ⚡
  </button>
  <ChatPanel />
</>
```

- [ ] **Step 4: Create `frontend/src/features/chat/` directory and verify**

```bash
mkdir -p frontend/src/features/chat
```

Run the frontend and verify the floating button appears and the panel opens/closes.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/chat/ frontend/src/shared/layout/Layout.tsx
git commit -m "feat(frontend): floating ChatPanel UI with SSE streaming and message history"
```

---

### Task 19: Settings Page — AI Key Management

**Files:**
- Create: `frontend/src/pages/SettingsPage.tsx`
- Modify: `frontend/src/app/router.tsx` (or App.tsx) — add `/settings` route

- [ ] **Step 1: Create SettingsPage.tsx**

```typescript
import { useState, useEffect } from 'react'
import axios from 'axios'

interface Connected {
  claude: boolean
  openai: boolean
  gemini: boolean
}

const PROVIDERS = [
  { id: 'claude', label: 'Claude (Anthropic)', placeholder: 'sk-ant-...' },
  { id: 'openai', label: 'OpenAI (GPT)', placeholder: 'sk-...' },
  { id: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
] as const

type Provider = 'claude' | 'openai' | 'gemini'

export default function SettingsPage() {
  const [connected, setConnected] = useState<Connected>({ claude: false, openai: false, gemini: false })
  const [preferred, setPreferred] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<Provider, string>>({ claude: '', openai: '', gemini: '' })
  const [status, setStatus] = useState<Record<Provider, string>>({ claude: '', openai: '', gemini: '' })

  const token = localStorage.getItem('auth_token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('/api/user/ai-keys', { headers }).then(({ data }) => {
      setConnected(data.connected)
      setPreferred(data.preferred)
    })
  }, [])

  const save = async (provider: Provider) => {
    const key = inputs[provider].trim()
    if (!key) return
    try {
      await axios.put(`/api/user/ai-keys/${provider}`, { key }, { headers })
      setConnected((c) => ({ ...c, [provider]: true }))
      setStatus((s) => ({ ...s, [provider]: 'Saved' }))
      setInputs((i) => ({ ...i, [provider]: '' }))
    } catch {
      setStatus((s) => ({ ...s, [provider]: 'Error saving key' }))
    }
    setTimeout(() => setStatus((s) => ({ ...s, [provider]: '' })), 3000)
  }

  const remove = async (provider: Provider) => {
    await axios.delete(`/api/user/ai-keys/${provider}`, { headers })
    setConnected((c) => ({ ...c, [provider]: false }))
    if (preferred === provider) setPreferred(null)
  }

  const makePreferred = async (provider: Provider) => {
    await axios.patch(`/api/user/ai-keys/${provider}/preferred`, {}, { headers })
    setPreferred(provider)
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 text-sm mb-8">
        Connect your AI provider keys. Keys are encrypted and stored securely — they never leave the server after saving.
      </p>

      <h2 className="text-lg font-semibold text-white mb-4">AI Providers</h2>

      <div className="space-y-4">
        {PROVIDERS.map(({ id, label, placeholder }) => (
          <div key={id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{label}</span>
                {connected[id] && (
                  <span className="text-xs bg-green-800 text-green-300 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                )}
                {preferred === id && (
                  <span className="text-xs bg-orange-800 text-orange-300 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              {connected[id] && (
                <div className="flex gap-2">
                  {preferred !== id && (
                    <button
                      onClick={() => makePreferred(id)}
                      className="text-xs text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => remove(id)}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={inputs[id]}
                onChange={(e) => setInputs((i) => ({ ...i, [id]: e.target.value }))}
                placeholder={connected[id] ? '••••••••••••••• (update key)' : placeholder}
                className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-500"
                aria-label={`${label} API key`}
              />
              <button
                onClick={() => save(id)}
                disabled={!inputs[id].trim()}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>

            {status[id] && (
              <p className="text-xs mt-2 text-green-400">{status[id]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add route to App.tsx**

In `frontend/src/App.tsx`, add a lazy import and route for SettingsPage inside the ProtectedRoute section:

```typescript
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Inside routes:
<Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
```

- [ ] **Step 3: Add Settings link to Header**

In `frontend/src/shared/layout/Header.tsx`, add a link to `/settings` next to the logout button:

```typescript
import { Link } from 'react-router-dom'
// Inside the authenticated section:
<Link to="/settings" className="text-gray-400 hover:text-white text-sm transition-colors">
  Settings
</Link>
```

- [ ] **Step 4: Verify end-to-end**

1. Log in → click Settings link in header → Settings page loads
2. Enter a real API key → click Save → "Connected" badge appears
3. Open chat panel (⚡ button) → type a message → response streams in
4. Reload page → connected status persists (from DB)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/SettingsPage.tsx frontend/src/App.tsx frontend/src/shared/layout/Header.tsx
git commit -m "feat(frontend): SettingsPage — BYOK AI key management with connected/preferred status"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Crypto ✓, AI key routes ✓, AIProvider interface ✓ (Claude/OpenAI/Gemini), context builder ✓, SSE chat route ✓, frontend api.ts ✓, real AuthContext ✓, chatStore ✓, ChatPanel ✓, SettingsPage ✓
- [x] **No placeholders:** All steps have real code or real curl commands
- [x] **Type consistency:** `ChatMessage` defined in `provider.ts` and used in all AI implementations; `AIProvider` interface used in chat route; `AuthVariables` from middleware/auth consistent across all routes; `Provider` type consistent across aiKeys.ts
- [x] **getDecryptedKey / getPreferredProvider** exported from aiKeys.ts and imported in chat.ts — consistent names
- [x] **SSE format** consistent between backend (streamSSE) and frontend (chatStore SSE reader)
