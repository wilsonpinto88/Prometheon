# Prometheon Backend Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the frontend-only repo into an npm workspace monorepo and build a Hono + PostgreSQL + Prisma backend with JWT auth and REST endpoints for texts, tasks, and progress.

**Architecture:** Root workspace contains `frontend/` (current React app) and `backend/` (Hono server). Backend exposes a REST API on port 3001; frontend calls it via Axios. All content (texts, tasks) lives in PostgreSQL, seeded from mock data. User progress is persisted per user in the DB.

**Tech Stack:** Node.js 20, TypeScript, Hono, @hono/node-server, Prisma, PostgreSQL, bcryptjs, jsonwebtoken, zod, @hono/zod-validator, tsx (dev), tsup (build)

**Assumptions:**
- PostgreSQL is installed and running locally. Will NOT work without a running PG instance.
- `.env` at workspace root holds `DATABASE_URL`, `JWT_SECRET` (32+ chars), `KEY_SECRET` (32+ chars).
- Node.js 20.11+ is installed.
- npm v8+ supports workspaces.

---

## File Structure

```
Prometheon/
├── package.json                        ← NEW: workspace root (workspaces: [frontend, backend])
├── .env                                ← NEW: DATABASE_URL, JWT_SECRET, KEY_SECRET
├── frontend/                           ← MOVED: current root src/ + configs
│   ├── src/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── index.ts                    ← Hono app + serve()
│   │   ├── routes/
│   │   │   ├── auth.ts                 ← POST /auth/register, /auth/login
│   │   │   ├── texts.ts                ← GET /api/texts, /api/texts/:id
│   │   │   ├── tasks.ts                ← GET /api/tasks, /api/tasks/:id
│   │   │   └── progress.ts             ← GET /api/progress, PATCH /api/tasks/:id/complete
│   │   ├── middleware/
│   │   │   ├── auth.ts                 ← JWT Bearer verify → c.set('userId')
│   │   │   └── error.ts                ← global error handler
│   │   └── db/
│   │       ├── client.ts               ← PrismaClient singleton
│   │       ├── seed.ts                 ← seed SacredText + Task rows from mock data
│   │       └── prisma/
│   │           └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
```

---

### Task 1: Workspace Root Setup

**Files:**
- Create: `package.json` (root, replaces existing)
- Create: `.env`

- [ ] **Step 1: Create workspace root package.json**

Replace the existing root `package.json` with a minimal workspace root (the real frontend package.json moves into `frontend/` in Task 2):

```json
{
  "name": "prometheon-workspace",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspace=frontend && npm run build --workspace=backend"
  }
}
```

- [ ] **Step 2: Create .env**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prometheon"
JWT_SECRET="change-me-to-a-32-plus-char-secret-key"
KEY_SECRET="change-me-to-another-32-char-secret"
```

- [ ] **Step 3: Verify workspace root is valid**

Run: `cat package.json`
Expected: shows `"workspaces": ["frontend", "backend"]`

---

### Task 2: Move Frontend Files

**Files:**
- Create: `frontend/` directory with all current frontend files moved into it
- Modify: `frontend/vite.config.ts` — update server proxy to point at backend

**Does NOT cover:** updating any frontend `import` paths or src/ references — those are unchanged since `src/` moves intact as a directory.

- [ ] **Step 1: Create frontend directory and move files**

Run these commands from the workspace root:

```bash
mkdir frontend
mv src frontend/src
mv index.html frontend/index.html
mv vite.config.ts frontend/vite.config.ts
mv tsconfig.json frontend/tsconfig.json
mv tsconfig.node.json frontend/tsconfig.node.json
mv tailwind.config.js frontend/tailwind.config.js
mv postcss.config.js frontend/postcss.config.js
mv package.json frontend/package.json
mv package-lock.json frontend/package-lock.json
```

- [ ] **Step 2: Add dev proxy to frontend/vite.config.ts**

Read the file, then edit to add a `server.proxy` block so frontend API calls reach the backend during dev:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/auth': 'http://localhost:3001',
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 3: Verify frontend still builds**

```bash
cd frontend && npm install && npm run build
```

Expected: Build succeeds with no errors. `dist/` created inside `frontend/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: monorepo — move frontend into frontend/ subdirectory"
```

---

### Task 3: Backend Init

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `backend/src/db/client.ts`
- Create: `backend/src/middleware/error.ts`

- [ ] **Step 1: Create backend/package.json**

```json
{
  "name": "@prometheon/backend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm --dts",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev --schema src/db/prisma/schema.prisma",
    "db:generate": "prisma generate --schema src/db/prisma/schema.prisma",
    "db:seed": "tsx src/db/seed.ts",
    "db:studio": "prisma studio --schema src/db/prisma/schema.prisma"
  },
  "dependencies": {
    "@hono/node-server": "^1.13.0",
    "@hono/zod-validator": "^0.4.1",
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "hono": "^4.6.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.0",
    "prisma": "^5.7.0",
    "tsup": "^8.0.1",
    "tsx": "^4.7.0",
    "typescript": "^5.2.2"
  }
}
```

- [ ] **Step 2: Create backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create backend/src/db/client.ts**

```typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

- [ ] **Step 4: Create backend/src/middleware/error.ts**

```typescript
import type { ErrorHandler } from 'hono'

export const errorMiddleware: ErrorHandler = (err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
}
```

- [ ] **Step 5: Create backend/src/index.ts**

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorMiddleware } from './middleware/error.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: 'http://localhost:5173', credentials: true }))

app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.onError(errorMiddleware)

serve({ fetch: app.fetch, port: 3001 }, () => {
  console.log('Backend running on http://localhost:3001')
})
```

- [ ] **Step 6: Install backend deps and verify server starts**

```bash
cd backend && npm install
npm run dev
```

Expected: `Backend running on http://localhost:3001` logged. `curl http://localhost:3001/health` returns `{"ok":true}`.

- [ ] **Step 7: Commit**

```bash
git add backend/ && git commit -m "feat(backend): init Hono server with health endpoint"
```

---

### Task 4: Prisma Schema + Migration

**Files:**
- Create: `backend/src/db/prisma/schema.prisma`

- [ ] **Step 1: Create schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  passwordHash  String
  createdAt     DateTime       @default(now())
  aiKeys        AIKey[]
  taskProgress  TaskProgress[]
  textProgress  TextProgress[]
  activities    Activity[]
  conversations Conversation[]
}

model AIKey {
  id           String  @id @default(cuid())
  userId       String
  provider     String
  encryptedKey String
  preferred    Boolean @default(false)
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider])
}

model SacredText {
  id           String         @id @default(cuid())
  title        String
  author       String
  realm        String
  description  String
  difficulty   String
  chapters     Int
  coverEmoji   String         @default("📚")
  textProgress TextProgress[]
}

model Task {
  id           String         @id @default(cuid())
  title        String
  description  String
  realm        String
  difficulty   String
  type         String
  points       Int            @default(10)
  taskProgress TaskProgress[]
}

model TaskProgress {
  id           String    @id @default(cuid())
  userId       String
  taskId       String
  status       String    @default("not_started")
  completedAt  DateTime?
  pointsEarned Int       @default(0)
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  task         Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@unique([userId, taskId])
}

model TextProgress {
  id          String    @id @default(cuid())
  userId      String
  textId      String
  status      String    @default("not_started")
  progress    Int       @default(0)
  completedAt DateTime?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  text        SacredText @relation(fields: [textId], references: [id], onDelete: Cascade)

  @@unique([userId, textId])
}

model Activity {
  id           String   @id @default(cuid())
  userId       String
  type         String
  entityId     String
  entityName   String
  pointsEarned Int      @default(0)
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String?
  createdAt DateTime  @default(now())
  messages  Message[]
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           String
  content        String
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2: Generate Prisma client + run migration**

```bash
cd backend
npx dotenv -e ../.env -- npm run db:generate
npx dotenv -e ../.env -- npm run db:migrate -- --name init
```

Expected: `✔ Generated Prisma Client` and migration applied. Tables visible in PG.

- [ ] **Step 3: Verify tables exist**

```bash
npx dotenv -e ../.env -- npx prisma studio --schema src/db/prisma/schema.prisma
```

Expected: Prisma Studio opens, shows all 9 tables.

- [ ] **Step 4: Commit**

```bash
git add backend/src/db/prisma && git commit -m "feat(backend): Prisma schema — all models + initial migration"
```

---

### Task 5: Seed Script

**Files:**
- Create: `backend/src/db/seed.ts`

- [ ] **Step 1: Create seed.ts with texts + tasks data**

```typescript
import { prisma } from './client.js'

const texts = [
  {
    id: 'text-1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    realm: 'Tartarus',
    description: 'A handbook of agile software craftsmanship covering naming, functions, and refactoring.',
    difficulty: 'intermediate',
    chapters: 17,
    coverEmoji: '🧹',
  },
  {
    id: 'text-2',
    title: 'The Pragmatic Programmer',
    author: 'Hunt & Thomas',
    realm: 'Tartarus',
    description: 'From journeyman to master — tips for pragmatic software development.',
    difficulty: 'intermediate',
    chapters: 9,
    coverEmoji: '🔧',
  },
  {
    id: 'text-3',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    realm: 'Asgard',
    description: 'Deep dive into databases, distributed systems, and data engineering.',
    difficulty: 'advanced',
    chapters: 12,
    coverEmoji: '🗄️',
  },
  {
    id: 'text-4',
    title: 'You Don\'t Know JS',
    author: 'Kyle Simpson',
    realm: 'Valhalla',
    description: 'Deep dive into JavaScript mechanics, scope, closures, and async.',
    difficulty: 'intermediate',
    chapters: 6,
    coverEmoji: '📜',
  },
]

const tasks = [
  {
    id: 'task-1',
    title: 'Build a Todo App',
    description: 'Create a full-stack todo application with React and a REST API.',
    realm: 'Tartarus',
    difficulty: 'beginner',
    type: 'project',
    points: 50,
  },
  {
    id: 'task-2',
    title: 'Implement a Binary Search Tree',
    description: 'Write a BST with insert, search, and traversal methods in TypeScript.',
    realm: 'Tartarus',
    difficulty: 'intermediate',
    type: 'algorithm',
    points: 30,
  },
  {
    id: 'task-3',
    title: 'Design a REST API',
    description: 'Design and document a RESTful API for a book library system.',
    realm: 'Asgard',
    difficulty: 'intermediate',
    type: 'design',
    points: 40,
  },
  {
    id: 'task-4',
    title: 'Set Up CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    realm: 'Asgard',
    difficulty: 'advanced',
    type: 'devops',
    points: 60,
  },
]

async function main() {
  console.log('Seeding database...')

  for (const text of texts) {
    await prisma.sacredText.upsert({
      where: { id: text.id },
      update: text,
      create: text,
    })
  }

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    })
  }

  console.log(`Seeded ${texts.length} texts and ${tasks.length} tasks.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run seed**

```bash
cd backend && npx dotenv -e ../.env -- npm run db:seed
```

Expected: `Seeded 4 texts and 4 tasks.`

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/seed.ts && git commit -m "feat(backend): seed SacredText and Task rows"
```

---

### Task 6: Auth Routes

**Files:**
- Create: `backend/src/routes/auth.ts`
- Modify: `backend/src/index.ts` — register auth route

- [ ] **Step 1: Create backend/src/routes/auth.ts**

```typescript
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
```

- [ ] **Step 2: Register route in backend/src/index.ts**

Add these imports and route registrations after the `/health` endpoint:

```typescript
import authRoutes from './routes/auth.js'
// ...after app.get('/health', ...)
app.route('/auth', authRoutes)
```

- [ ] **Step 3: Verify register + login work**

Start backend: `cd backend && npx dotenv -e ../.env -- npm run dev`

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Prometheus","password":"password123"}'
# Expected: {"token":"eyJ...","user":{"id":"...","email":"test@test.com","name":"Prometheus"}}

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Expected: {"token":"eyJ...","user":{...}}

# Duplicate register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Dup","password":"password123"}'
# Expected: 409 {"error":"Email already registered"}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/auth.ts backend/src/index.ts
git commit -m "feat(backend): auth routes — register + login with JWT"
```

---

### Task 7: JWT Middleware

**Files:**
- Create: `backend/src/middleware/auth.ts`

- [ ] **Step 1: Create backend/src/middleware/auth.ts**

```typescript
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
```

- [ ] **Step 2: Verify middleware blocks unauthenticated requests**

We'll test this in Task 8 when we add a protected route. For now, manually test by calling a route (to be added) without a token.

---

### Task 8: Texts + Tasks Endpoints

**Files:**
- Create: `backend/src/routes/texts.ts`
- Create: `backend/src/routes/tasks.ts`
- Modify: `backend/src/index.ts` — register both routes

- [ ] **Step 1: Create backend/src/routes/texts.ts**

```typescript
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
```

- [ ] **Step 2: Create backend/src/routes/tasks.ts**

```typescript
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
```

- [ ] **Step 3: Register routes in backend/src/index.ts**

```typescript
import textsRoutes from './routes/texts.js'
import tasksRoutes from './routes/tasks.js'
// ...
app.route('/api/texts', textsRoutes)
app.route('/api/tasks', tasksRoutes)
```

- [ ] **Step 4: Verify endpoints**

Get a token first (from Task 6 login), then:

```bash
TOKEN="eyJ..."   # paste token from login

curl http://localhost:3001/api/texts \
  -H "Authorization: Bearer $TOKEN"
# Expected: JSON array of 4 texts

curl http://localhost:3001/api/texts/text-1 \
  -H "Authorization: Bearer $TOKEN"
# Expected: JSON object for Clean Code

curl http://localhost:3001/api/texts/nonexistent \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 {"error":"Not found"}

curl http://localhost:3001/api/texts
# Expected: 401 {"error":"Unauthorized"}
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/texts.ts backend/src/routes/tasks.ts backend/src/index.ts
git commit -m "feat(backend): texts + tasks REST endpoints with JWT auth"
```

---

### Task 9: Progress Endpoints

**Files:**
- Create: `backend/src/routes/progress.ts`
- Modify: `backend/src/index.ts` — register progress route

- [ ] **Step 1: Create backend/src/routes/progress.ts**

```typescript
import { Hono } from 'hono'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import { prisma } from '../db/client.js'

const progress = new Hono<{ Variables: AuthVariables }>()
progress.use('*', requireAuth)

progress.get('/', async (c) => {
  const userId = c.get('userId')

  const [taskProgress, textProgress, allTasks] = await Promise.all([
    prisma.taskProgress.findMany({ where: { userId }, include: { task: true } }),
    prisma.textProgress.findMany({ where: { userId }, include: { text: true } }),
    prisma.task.findMany(),
  ])

  const tasksCompleted = taskProgress.filter((tp) => tp.status === 'completed').length
  const booksRead = textProgress.filter((tp) => tp.status === 'completed').length
  const totalPoints = taskProgress
    .filter((tp) => tp.status === 'completed')
    .reduce((sum, tp) => sum + tp.pointsEarned, 0)

  const realmCounts: Record<string, { completed: number; total: number }> = {}
  for (const task of allTasks) {
    if (!realmCounts[task.realm]) realmCounts[task.realm] = { completed: 0, total: 0 }
    realmCounts[task.realm].total++
  }
  for (const tp of taskProgress) {
    if (tp.status === 'completed' && realmCounts[tp.task.realm]) {
      realmCounts[tp.task.realm].completed++
    }
  }

  const currentRealm =
    Object.entries(realmCounts).find(([, v]) => v.completed < v.total)?.[0] ?? 'Valhalla'

  const taskMap = Object.fromEntries(
    taskProgress.map((tp) => [
      tp.taskId,
      { status: tp.status, completed: tp.status === 'completed', pointsEarned: tp.pointsEarned },
    ])
  )

  return c.json({
    tasksCompleted,
    booksRead,
    totalPoints,
    currentRealm,
    taskProgress: taskMap,
  })
})

progress.patch('/tasks/:id/complete', async (c) => {
  const userId = c.get('userId')
  const taskId = c.req.param('id')

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return c.json({ error: 'Task not found' }, 404)

  const existing = await prisma.taskProgress.findUnique({
    where: { userId_taskId: { userId, taskId } },
  })

  if (existing?.status === 'completed') {
    const updated = await prisma.taskProgress.update({
      where: { userId_taskId: { userId, taskId } },
      data: { status: 'not_started', completedAt: null, pointsEarned: 0 },
    })
    return c.json({ taskId, completed: false, status: updated.status })
  }

  const updated = await prisma.taskProgress.upsert({
    where: { userId_taskId: { userId, taskId } },
    create: {
      userId,
      taskId,
      status: 'completed',
      completedAt: new Date(),
      pointsEarned: task.points,
    },
    update: {
      status: 'completed',
      completedAt: new Date(),
      pointsEarned: task.points,
    },
  })

  return c.json({ taskId, completed: true, status: updated.status, pointsEarned: task.points })
})

export default progress
```

- [ ] **Step 2: Register in backend/src/index.ts**

```typescript
import progressRoutes from './routes/progress.js'
// ...
app.route('/api/progress', progressRoutes)
```

- [ ] **Step 3: Verify progress endpoints**

```bash
TOKEN="eyJ..."

# Get progress (fresh user — all zeros)
curl http://localhost:3001/api/progress \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"tasksCompleted":0,"booksRead":0,"totalPoints":0,"currentRealm":"Tartarus","taskProgress":{}}

# Complete a task
curl -X PATCH http://localhost:3001/api/progress/tasks/task-1/complete \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"taskId":"task-1","completed":true,"status":"completed","pointsEarned":50}

# Get progress again
curl http://localhost:3001/api/progress \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"tasksCompleted":1,"totalPoints":50,"taskProgress":{"task-1":{"status":"completed","completed":true,"pointsEarned":50},...}}

# Toggle back off
curl -X PATCH http://localhost:3001/api/progress/tasks/task-1/complete \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"taskId":"task-1","completed":false}
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/progress.ts backend/src/index.ts
git commit -m "feat(backend): progress endpoints — GET summary + PATCH task complete/undo"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Monorepo ✓, Hono server ✓, Prisma schema ✓, JWT auth ✓, texts/tasks endpoints ✓, progress endpoints ✓
- [x] **No placeholders:** All steps have actual commands or code blocks
- [x] **Type consistency:** `AuthVariables` defined in `middleware/auth.ts` and imported consistently in all routes
- [x] **Missing:** AI keys + chat routes → covered in Plan 2
- [x] **Missing:** Frontend integration (replace mock api.ts, real AuthContext) → covered in Plan 2

---

**Plan 2 covers:** BYOK AI key storage, AIProvider abstraction, chat endpoint with SSE, frontend api.ts replacement, real JWT AuthContext, chatStore, ChatPanel UI, and SettingsPage.
