# Prometheon Backend + AI Study Agent — Design Spec
Date: 2026-05-25

## Scope
- Replace mock `src/services/api.ts` with a real Node.js backend
- Replace mock `AuthContext` with JWT auth backed by a real DB
- BYOK (bring-your-own-key) AI integration: Claude, OpenAI, Gemini
- AI chat agent with learning-context injection
- Floating chat panel UI in the frontend

## Non-goals (v1)
- WebSocket real-time streaming (SSE only)
- OAuth SSO (email+password only)
- Multi-user collaboration
- Mobile app

---

## Monorepo Structure

```
Prometheon/
├── frontend/          ← current src/ + index.html + vite.config.ts etc.
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── index.ts         ← Hono app entry
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── texts.ts
│   │   │   ├── tasks.ts
│   │   │   ├── progress.ts
│   │   │   └── chat.ts
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── provider.ts      ← AIProvider interface
│   │   │   │   ├── claude.ts
│   │   │   │   ├── openai.ts
│   │   │   │   └── gemini.ts
│   │   │   ├── context.ts           ← context injection builder
│   │   │   └── crypto.ts            ← AES-256-GCM key encryption
│   │   ├── middleware/
│   │   │   ├── auth.ts              ← JWT verify middleware
│   │   │   └── error.ts
│   │   └── db/
│   │       ├── prisma/
│   │       │   └── schema.prisma
│   │       └── client.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json        ← workspace root (npm workspaces)
└── .env                ← DATABASE_URL, JWT_SECRET, KEY_SECRET
```

---

## Backend Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Hono | TypeScript-first, edge-compatible, Express-like API |
| Database | PostgreSQL | Fits relational progress schema |
| ORM | Prisma | Type-safe, migrations, matches existing data models in Docs/04 |
| Auth | JWT (jsonwebtoken) + bcrypt | Simple, stateless, fits SPA |
| AI SDKs | @anthropic-ai/sdk, openai, @google/generative-ai | Official SDKs |

---

## Database Schema (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
  aiKeys       AIKey[]
  progress     UserProgress?
  taskProgress TaskProgress[]
  textProgress TextProgress[]
  activities   Activity[]
  conversations Conversation[]
}

model AIKey {
  id           String   @id @default(cuid())
  userId       String
  provider     String   // "claude" | "openai" | "gemini"
  encryptedKey String
  preferred    Boolean  @default(false)
  user         User     @relation(fields: [userId], references: [id])
}

model UserProgress {
  id              String   @id @default(cuid())
  userId          String   @unique
  currentRealm    String
  totalPoints     Int      @default(0)
  booksRead       Int      @default(0)
  tasksCompleted  Int      @default(0)
  user            User     @relation(fields: [userId], references: [id])
}

model TaskProgress {
  id          String   @id @default(cuid())
  userId      String
  taskId      String
  status      String   @default("not_started")
  completedAt DateTime?
  pointsEarned Int     @default(0)
  user        User     @relation(fields: [userId], references: [id])
  @@unique([userId, taskId])
}

model TextProgress {
  id          String   @id @default(cuid())
  userId      String
  textId      String
  status      String   @default("not_started")
  progress    Int      @default(0)
  completedAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
  @@unique([userId, textId])
}

model Activity {
  id          String   @id @default(cuid())
  userId      String
  type        String
  entityId    String
  entityName  String
  pointsEarned Int     @default(0)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String?
  createdAt DateTime  @default(now())
  messages  Message[]
  user      User      @relation(fields: [userId], references: [id])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           String       // "user" | "assistant"
  content        String
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])
}
```

---

## API Endpoints

### Auth
- `POST /auth/register` — create account
- `POST /auth/login` → `{ token, user }`

### Texts & Tasks (replaces mock api.ts)
- `GET /api/texts` — list
- `GET /api/texts/:id`
- `GET /api/tasks`
- `GET /api/tasks/:id`

### Progress
- `GET /api/progress` — full user progress
- `PATCH /api/tasks/:id/complete` — toggle complete
- `PATCH /api/texts/:id/progress` — update reading progress

### AI Keys
- `GET /api/user/ai-keys` → `{ claude: true, openai: false, gemini: false, preferred: "claude" }`
- `PUT /api/user/ai-keys/:provider` — save/update encrypted key
- `DELETE /api/user/ai-keys/:provider`

### Chat
- `POST /api/chat` — send message, returns AI response (SSE stream)
  - Body: `{ message, conversationId?, contextEntityId?, contextEntityType? }`
- `GET /api/chat/conversations` — list conversations
- `GET /api/chat/conversations/:id` — messages in conversation

---

## BYOK Key Storage

1. User submits plain key from Settings UI
2. `PUT /api/user/ai-keys/:provider` → backend encrypts with AES-256-GCM using `KEY_SECRET` env var
3. Encrypted blob stored in `AIKey.encryptedKey`
4. On chat request: backend decrypts in-memory → passes to AI SDK → key never leaves server
5. Frontend only receives `{ claude: true, openai: false }` — never the key

---

## AI Provider Interface

```typescript
interface ChatMessage { role: 'user' | 'assistant'; content: string }

interface AIProvider {
  chat(messages: ChatMessage[], systemPrompt: string): AsyncIterable<string>
}
```

Implementations wrap Anthropic, OpenAI, and Gemini SDKs. All stream tokens via async generator.

---

## Context Injection (System Prompt)

When `POST /api/chat` arrives:
1. Load user progress from DB (realm, points, task/text counts)
2. If `contextEntityId` provided, load that task or text record
3. Build system prompt (max 2000 tokens):

```
You are a study assistant for Prometheon, a learning platform themed around mythological realms.

User: {name}
Current Realm: {currentRealm}
Progress: {tasksCompleted} tasks completed, {booksRead} books read, {totalPoints} points

Currently viewing: {entity.title} ({entity.type})
{entity.description}

Help the user understand, practice, and progress through their learning journey.
Keep responses concise and actionable.
```

---

## Chat UI (Frontend)

- **Trigger**: floating button, bottom-right, fixed position
- **Panel**: slides up from bottom-right, 380px wide, 520px tall, dark-themed (matches app)
- **Layout**: conversation list → message thread → input bar
- **State**: `chatStore.ts` (Zustand) — open/closed, active conversation, messages
- **API**: TanStack Query mutation for send, SSE reader for streaming tokens
- **Context**: auto-detects current page (text detail → sends textId, task detail → sends taskId)
- **Settings link**: "Configure AI keys" → `/settings/ai` page

---

## Frontend Changes Required

1. Move `src/` → `frontend/src/` (monorepo restructure)
2. Replace `AuthContext` mock → real JWT auth via `POST /auth/login`
3. Replace `src/services/api.ts` mock delays → real Axios calls to backend
4. Replace Zustand `progressStore` mock data → fetched from `GET /api/progress`
5. Add `chatStore.ts` + `ChatPanel.tsx` floating UI
6. Add `SettingsPage` with AI key management

---

## Failure Modes

| Risk | Severity | Mitigation |
|------|----------|-----------|
| AI key invalid/expired mid-chat | Minor | Catch SDK auth errors → return `{ error: 'api_key_invalid' }` → UI shows actionable message |
| `KEY_SECRET` env var lost | Minor (ops) | Document backup requirement; keys unrecoverable by design (security property) |
| Context prompt exceeds token limit | Minor | Cap system prompt — include only realm + 3 recent activities + current entity |
