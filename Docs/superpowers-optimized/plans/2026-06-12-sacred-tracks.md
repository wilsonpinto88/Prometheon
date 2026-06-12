# Sacred Tracks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-optimized:subagent-driven-development (recommended) or superpowers-optimized:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock Sacred Texts/Tasks with 3 real open-source learning tracks (AI, ML, Cloud Infra for AI) with per-chapter progress tracking.

**Architecture:** New `Chapter` + `ChapterProgress` Prisma models; seed data moves to a dedicated `seedData.ts` with 3 texts × 12 chapters + 15 exercise tasks. Texts endpoints return chapters + per-user progress; a chapter toggle endpoint derives `TextProgress` automatically. Frontend detail page becomes a track hub with chapter checklist; `progressStore` switches from mockTasks to the API.

**Tech Stack:** Existing: Hono, Prisma/PostgreSQL, React 18, Zustand, Vitest/RTL.

**Assumptions:**
- Dev DB only; reseeding wipes existing texts/tasks/progress — will NOT preserve any user progress.
- Backend has no test harness; backend verification is via curl. Frontend changes get RTL tests.
- Resource URLs are curated from known course structures and MUST pass the Task 3 link check; broken ones are fixed there — the plan does NOT assume every URL below is already live.
- Backend dev runs with PowerShell env vars (`$env:DATABASE_URL`, `$env:JWT_SECRET`, `$env:KEY_SECRET`) — dotenv-cli is not installed.

---

## File Structure

```
backend/
├── src/db/prisma/schema.prisma     ← MODIFY: Chapter, ChapterProgress, SacredText.attribution, drop chapters Int
├── src/db/seedData.ts              ← NEW: 3 texts + 36 chapters + 15 tasks (single source of truth)
├── src/db/seed.ts                  ← MODIFY: wipe + seed from seedData.ts
├── scripts/check-links.ts          ← NEW: HEAD-checks every resourceUrl
├── src/routes/texts.ts             ← MODIFY: chapterCount/progressPct on list; chapters+completed on detail
└── src/routes/progress.ts          ← MODIFY: PATCH /chapters/:id/complete + TextProgress derivation

frontend/
├── src/shared/types/sacredText.ts  ← MODIFY: align to API (chapters, progress, attribution)
├── src/shared/store/progressStore.ts ← MODIFY: fetch tasks from API (drop mockTasks init)
├── src/pages/SacredTextsPage.tsx   ← MODIFY: progress bar + chapterCount on cards
├── src/pages/SacredTextDetailPage.tsx ← REPLACE: track hub (chapter checklist, optimistic toggle, chat context)
├── src/pages/SacredTextDetailPage.test.tsx ← NEW: checklist render + toggle tests
└── src/data/mockTexts.ts, mockTasks.ts ← DELETE
```

---

### Task 1: Schema — Chapter + ChapterProgress

**Files:**
- Modify: `backend/src/db/prisma/schema.prisma`

- [ ] **Step 1: Edit schema**

In `model SacredText`: remove `chapters Int`, add:

```prisma
  attribution String    @default("")
  chapterList Chapter[]
```

In `model User`, add: `chapterProgress ChapterProgress[]`

Append:

```prisma
model Chapter {
  id            String            @id @default(cuid())
  textId        String
  order         Int
  title         String
  summary       String
  resourceUrl   String
  resourceLabel String
  estMinutes    Int               @default(30)
  text          SacredText        @relation(fields: [textId], references: [id], onDelete: Cascade)
  progress      ChapterProgress[]

  @@unique([textId, order])
}

model ChapterProgress {
  id          String   @id @default(cuid())
  userId      String
  chapterId   String
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  @@unique([userId, chapterId])
}
```

- [ ] **Step 2: Migrate**

```powershell
cd backend
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/prometheon"
npx prisma migrate dev --name sacred-tracks-chapters --schema src/db/prisma/schema.prisma
```

Expected: migration applied, client regenerated. (Dropping `chapters` may warn about data loss — accept; column is unused after reseed.)

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/prisma/
git commit -m "feat(backend): Chapter + ChapterProgress models, SacredText.attribution"
```

---

### Task 2: Seed Data — 3 tracks, 36 chapters, 15 tasks

**Files:**
- Create: `backend/src/db/seedData.ts`

- [ ] **Step 1: Create seedData.ts with the full curated content**

```typescript
export interface SeedChapter {
  order: number
  title: string
  summary: string
  resourceUrl: string
  resourceLabel: string
  estMinutes: number
}

export interface SeedText {
  title: string
  author: string
  realm: string
  description: string
  difficulty: string
  coverEmoji: string
  attribution: string
  chapters: SeedChapter[]
}

export interface SeedTask {
  title: string
  description: string
  realm: string
  difficulty: string
  type: string
  points: number
}

const AIB = 'https://github.com/microsoft/AI-For-Beginners/tree/main/lessons'
const MLCC = 'https://developers.google.com/machine-learning/crash-course'
const D2L = 'https://d2l.ai'
const MWML = 'https://madewithml.com'

export const seedTexts: SeedText[] = [
  {
    title: 'The Flame of Prometheus',
    author: 'Foundations of Artificial Intelligence',
    realm: 'Prometheon',
    description:
      'Steal the fire of intelligence itself. From symbolic reasoning to neural networks, vision, language and ethics — the complete foundations of AI.',
    difficulty: 'Beginner',
    coverEmoji: '🔥',
    attribution: 'Based on Microsoft "AI For Beginners" (MIT license) — github.com/microsoft/AI-For-Beginners',
    chapters: [
      { order: 1, title: 'What is AI?', summary: 'Definitions of intelligence, the Turing test, and the difference between weak and strong AI.', resourceUrl: `${AIB}/1-Intro`, resourceLabel: 'AI For Beginners — Lesson 1', estMinutes: 45 },
      { order: 2, title: 'A Brief History of AI', summary: 'From the Dartmouth workshop through AI winters to the deep learning era.', resourceUrl: `${AIB}/1-Intro`, resourceLabel: 'AI For Beginners — Lesson 1 (History section)', estMinutes: 30 },
      { order: 3, title: 'Symbolic AI & Knowledge Representation', summary: 'Expert systems, ontologies and why hand-coding knowledge hits a wall.', resourceUrl: `${AIB}/2-Symbolic`, resourceLabel: 'AI For Beginners — Lesson 2', estMinutes: 60 },
      { order: 4, title: 'The Perceptron', summary: 'The simplest neural network: weights, bias and a learning rule from 1957 that started it all.', resourceUrl: `${AIB}/3-NeuralNetworks/03-Perceptron`, resourceLabel: 'AI For Beginners — Lesson 3', estMinutes: 60 },
      { order: 5, title: 'Multi-Layer Networks & Backpropagation', summary: 'Stacking layers, computing gradients, and building a tiny framework by hand.', resourceUrl: `${AIB}/3-NeuralNetworks/04-OwnFramework`, resourceLabel: 'AI For Beginners — Lesson 4', estMinutes: 90 },
      { order: 6, title: 'Neural Frameworks (PyTorch/TensorFlow)', summary: 'Let autograd do the gradients: the same network in a real framework.', resourceUrl: `${AIB}/3-NeuralNetworks/05-Frameworks`, resourceLabel: 'AI For Beginners — Lesson 5', estMinutes: 90 },
      { order: 7, title: 'Computer Vision & CNNs', summary: 'Convolutions, pooling and why CNNs see images the way they do.', resourceUrl: `${AIB}/4-ComputerVision`, resourceLabel: 'AI For Beginners — Computer Vision section', estMinutes: 120 },
      { order: 8, title: 'Natural Language & Embeddings', summary: 'Bag-of-words to word2vec: turning text into vectors machines can reason about.', resourceUrl: `${AIB}/5-NLP`, resourceLabel: 'AI For Beginners — NLP section', estMinutes: 120 },
      { order: 9, title: 'Language Models & Transformers', summary: 'Attention, transformers and the architecture behind modern LLMs.', resourceUrl: `${AIB}/5-NLP`, resourceLabel: 'AI For Beginners — NLP section (transformers)', estMinutes: 90 },
      { order: 10, title: 'Genetic Algorithms', summary: 'Evolution as a search strategy: selection, crossover and mutation.', resourceUrl: `${AIB}/6-Other`, resourceLabel: 'AI For Beginners — Other AI methods', estMinutes: 60 },
      { order: 11, title: 'Reinforcement Learning', summary: 'Agents, rewards and learning by trial and error — from CartPole to game-playing AIs.', resourceUrl: `${AIB}/6-Other`, resourceLabel: 'AI For Beginners — Other AI methods (RL)', estMinutes: 90 },
      { order: 12, title: 'AI Ethics & Responsible AI', summary: 'Bias, fairness, transparency — the obligations that come with stolen fire.', resourceUrl: `${AIB}/7-Ethics`, resourceLabel: 'AI For Beginners — Ethics', estMinutes: 45 },
    ],
  },
  {
    title: 'The Loom of the Fates',
    author: 'Mastering Machine Learning',
    realm: 'Asgard',
    description:
      'Weave patterns from raw threads of data. Fundamentals with Google’s ML Crash Course, then deep into the loom with Dive into Deep Learning.',
    difficulty: 'Intermediate',
    coverEmoji: '🧵',
    attribution: 'Based on Google "ML Crash Course" (CC-BY) and "Dive into Deep Learning" (d2l.ai)',
    chapters: [
      { order: 1, title: 'What is Machine Learning?', summary: 'Supervised vs unsupervised learning and the anatomy of an ML problem.', resourceUrl: `${MLCC}`, resourceLabel: 'ML Crash Course — Intro', estMinutes: 30 },
      { order: 2, title: 'Linear Regression & Loss', summary: 'Fitting a line, measuring error with MSE, and what "learning" actually minimizes.', resourceUrl: `${MLCC}/linear-regression`, resourceLabel: 'ML Crash Course — Linear Regression', estMinutes: 60 },
      { order: 3, title: 'Gradient Descent', summary: 'Walking downhill on the loss surface: learning rate, convergence, and stochastic variants.', resourceUrl: `${MLCC}/linear-regression`, resourceLabel: 'ML Crash Course — Linear Regression (gradient descent)', estMinutes: 45 },
      { order: 4, title: 'Classification & Logistic Regression', summary: 'From regression to decision boundaries: sigmoid, log loss, precision/recall and ROC.', resourceUrl: `${MLCC}/logistic-regression`, resourceLabel: 'ML Crash Course — Logistic Regression', estMinutes: 60 },
      { order: 5, title: 'Generalization: Train, Validate, Test', summary: 'Overfitting, data splits and why your model lies to you on training data.', resourceUrl: `${MLCC}/overfitting`, resourceLabel: 'ML Crash Course — Overfitting', estMinutes: 45 },
      { order: 6, title: 'Working with Data: Features', summary: 'Numerical and categorical features, normalization, and feature crosses.', resourceUrl: `${MLCC}/numerical-data`, resourceLabel: 'ML Crash Course — Working with data', estMinutes: 60 },
      { order: 7, title: 'Linear Neural Networks (d2l)', summary: 'The same regression/classification, rebuilt rigorously with tensors and autograd.', resourceUrl: `${D2L}/chapter_linear-regression/index.html`, resourceLabel: 'Dive into Deep Learning — Linear Networks', estMinutes: 120 },
      { order: 8, title: 'Multilayer Perceptrons', summary: 'Hidden layers, activation functions, dropout and weight decay.', resourceUrl: `${D2L}/chapter_multilayer-perceptrons/index.html`, resourceLabel: 'Dive into Deep Learning — MLPs', estMinutes: 150 },
      { order: 9, title: 'Convolutional Neural Networks', summary: 'Convolutions from first principles: LeNet to modern CNN design.', resourceUrl: `${D2L}/chapter_convolutional-neural-networks/index.html`, resourceLabel: 'Dive into Deep Learning — CNNs', estMinutes: 150 },
      { order: 10, title: 'Recurrent Networks & Sequences', summary: 'Modeling sequences: RNNs, LSTMs, GRUs and their failure modes.', resourceUrl: `${D2L}/chapter_recurrent-neural-networks/index.html`, resourceLabel: 'Dive into Deep Learning — RNNs', estMinutes: 150 },
      { order: 11, title: 'Attention & Transformers', summary: 'Queries, keys, values — the mechanism that replaced recurrence.', resourceUrl: `${D2L}/chapter_attention-mechanisms-and-transformers/index.html`, resourceLabel: 'Dive into Deep Learning — Attention', estMinutes: 180 },
      { order: 12, title: 'Optimization Algorithms', summary: 'SGD, momentum, Adam — why training converges (or doesn’t).', resourceUrl: `${D2L}/chapter_optimization/index.html`, resourceLabel: 'Dive into Deep Learning — Optimization', estMinutes: 120 },
    ],
  },
  {
    title: 'The Forge of Olympus',
    author: 'Cloud Infrastructure for AI',
    realm: 'Olympus',
    description:
      'Forge ML systems that survive contact with production: design, deploy, monitor and scale machine learning in the cloud.',
    difficulty: 'Advanced',
    coverEmoji: '⚒️',
    attribution: 'Based on "Made With ML" by Goku Mohandas (MIT license) — madewithml.com',
    chapters: [
      { order: 1, title: 'ML Systems Design', summary: 'Product thinking for ML: framing the problem before touching a model.', resourceUrl: `${MWML}/courses/mlops/design/`, resourceLabel: 'Made With ML — Design', estMinutes: 60 },
      { order: 2, title: 'Data Engineering & Preparation', summary: 'Splitting, preprocessing and versioning the data your system depends on.', resourceUrl: `${MWML}/courses/mlops/preparation/`, resourceLabel: 'Made With ML — Data preparation', estMinutes: 90 },
      { order: 3, title: 'Distributed Training', summary: 'Training beyond one machine: data parallelism and compute scaling.', resourceUrl: `${MWML}/courses/mlops/training/`, resourceLabel: 'Made With ML — Training', estMinutes: 120 },
      { order: 4, title: 'Experiment Tracking', summary: 'MLflow-style tracking: never lose a run, a metric, or a model again.', resourceUrl: `${MWML}/courses/mlops/experiment-tracking/`, resourceLabel: 'Made With ML — Experiment tracking', estMinutes: 60 },
      { order: 5, title: 'Testing ML Systems', summary: 'Testing code, data and models — pytest for pipelines, expectations for data.', resourceUrl: `${MWML}/courses/mlops/testing/`, resourceLabel: 'Made With ML — Testing', estMinutes: 120 },
      { order: 6, title: 'Model Serving', summary: 'Batch vs real-time inference; serving predictions behind an API.', resourceUrl: `${MWML}/courses/mlops/serving/`, resourceLabel: 'Made With ML — Serving', estMinutes: 90 },
      { order: 7, title: 'Containerization (Docker)', summary: 'Reproducible environments: packaging training and serving into containers.', resourceUrl: `${MWML}/courses/mlops/docker/`, resourceLabel: 'Made With ML — Docker', estMinutes: 60 },
      { order: 8, title: 'Workflow Orchestration', summary: 'DAGs and schedulers: turning notebooks into reliable pipelines.', resourceUrl: `${MWML}/courses/mlops/orchestration/`, resourceLabel: 'Made With ML — Orchestration', estMinutes: 90 },
      { order: 9, title: 'CI/CD for Machine Learning', summary: 'Automated testing and deployment workflows for models, not just code.', resourceUrl: `${MWML}/courses/mlops/cicd/`, resourceLabel: 'Made With ML — CI/CD', estMinutes: 90 },
      { order: 10, title: 'Monitoring & Drift', summary: 'Production vigilance: performance decay, data drift and alerting.', resourceUrl: `${MWML}/courses/mlops/monitoring/`, resourceLabel: 'Made With ML — Monitoring', estMinutes: 90 },
      { order: 11, title: 'Data Stack & Feature Stores', summary: 'Warehouses, feature stores and keeping training/serving features consistent.', resourceUrl: `${MWML}/courses/mlops/feature-store/`, resourceLabel: 'Made With ML — Feature store', estMinutes: 60 },
      { order: 12, title: 'Scaling & Cost in the Cloud', summary: 'Right-sizing compute, spot instances and the economics of ML infrastructure.', resourceUrl: `${MWML}/courses/mlops/systems-design/`, resourceLabel: 'Made With ML — Systems design', estMinutes: 60 },
    ],
  },
]

export const seedTasks: SeedTask[] = [
  // Flame of Prometheus (Prometheon)
  { title: 'Build a Perceptron from Scratch', description: 'Implement the perceptron learning rule in plain Python/NumPy and train it on a linearly separable dataset. No frameworks allowed.', realm: 'Prometheon', difficulty: 'Easy', type: 'Coding', points: 100 },
  { title: 'Train a CNN on MNIST', description: 'Use PyTorch or TensorFlow to build and train a small convolutional network on MNIST. Report accuracy and show 5 misclassified digits.', realm: 'Prometheon', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'Minimax Tic-Tac-Toe', description: 'Implement an unbeatable tic-tac-toe AI using minimax with alpha-beta pruning. Play 10 games against it to verify.', realm: 'Prometheon', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'Explore Word Embeddings', description: 'Load pre-trained word vectors and explore analogies (king - man + woman ≈ ?). Write up 5 interesting/broken analogies you find.', realm: 'Prometheon', difficulty: 'Easy', type: 'Coding', points: 100 },
  { title: 'Evolve a Solution', description: 'Implement a genetic algorithm that evolves a string toward a target phrase. Chart fitness over generations.', realm: 'Prometheon', difficulty: 'Medium', type: 'Coding', points: 200 },
  // Loom of the Fates (Asgard)
  { title: 'Linear Regression by Hand', description: 'Derive and implement gradient descent for linear regression without any ML library. Verify against scikit-learn on the same data.', realm: 'Asgard', difficulty: 'Easy', type: 'Coding', points: 100 },
  { title: 'Feature Engineering Lab', description: 'Take a messy tabular dataset, engineer features (normalization, crosses, encodings) and measure the accuracy delta on a simple model.', realm: 'Asgard', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'MLP from Scratch', description: 'Implement a two-layer perceptron with backpropagation in NumPy (d2l exercise). Match framework results on a small dataset.', realm: 'Asgard', difficulty: 'Hard', type: 'Coding', points: 400 },
  { title: 'Regularize a Network', description: 'Demonstrate overfitting on purpose, then fix it: apply dropout and weight decay, and chart train vs validation curves before/after.', realm: 'Asgard', difficulty: 'Medium', type: 'Coding', points: 250 },
  { title: 'Implement Attention Scoring', description: 'Implement scaled dot-product attention from the formula and verify your output against a framework implementation.', realm: 'Asgard', difficulty: 'Hard', type: 'Coding', points: 400 },
  // Forge of Olympus (Olympus)
  { title: 'Serve a Model with FastAPI', description: 'Wrap a trained model in a FastAPI prediction endpoint with input validation and a /health route. Load-test it with 100 requests.', realm: 'Olympus', difficulty: 'Medium', type: 'Coding', points: 250 },
  { title: 'Dockerize a Training Job', description: 'Write a Dockerfile that runs a training script reproducibly. Same results inside and outside the container.', realm: 'Olympus', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'Test an ML Pipeline', description: 'Write pytest tests for an ML pipeline: data validation tests, a model behavioral test, and a training smoke test.', realm: 'Olympus', difficulty: 'Hard', type: 'Coding', points: 400 },
  { title: 'Track Your Experiments', description: 'Set up MLflow (or W&B free tier) and log 5 training runs with different hyperparameters. Compare them in the UI.', realm: 'Olympus', difficulty: 'Easy', type: 'Coding', points: 150 },
  { title: 'Design a Drift Detector', description: 'Research data drift detection methods, then implement a simple statistical drift check between two dataset snapshots and write up your approach.', realm: 'Olympus', difficulty: 'Hard', type: 'Research', points: 500 },
]
```

- [ ] **Step 2: Typecheck**

Run: `cd backend; npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/seedData.ts
git commit -m "feat(backend): curated seed data — 3 tracks, 36 chapters, 15 exercises"
```

---

### Task 3: Link Checker — verify every resourceUrl

**Files:**
- Create: `backend/scripts/check-links.ts`

**Does NOT cover:** ongoing link monitoring — this is a seed-time gate only.

- [ ] **Step 1: Create check-links.ts**

```typescript
import { seedTexts } from '../src/db/seedData.js'

async function check(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' })
    return res.status
  } catch {
    return 0
  }
}

const urls = seedTexts.flatMap((t) => t.chapters.map((c) => ({ text: t.title, ch: c.order, url: c.resourceUrl })))
let failures = 0

for (const { text, ch, url } of urls) {
  const status = await check(url)
  const ok = status >= 200 && status < 400
  if (!ok) failures++
  console.log(`${ok ? 'OK ' : 'FAIL'} [${status}] ${text} #${ch} ${url}`)
}

console.log(failures === 0 ? `\nAll ${urls.length} links OK` : `\n${failures} broken link(s) — fix seedData.ts before seeding`)
process.exit(failures === 0 ? 0 : 1)
```

- [ ] **Step 2: Run and fix any failures**

Run: `cd backend; npx tsx scripts/check-links.ts`
Expected: `All 36 links OK`. If any FAIL: open the source site, find the moved lesson, update that `resourceUrl` in `seedData.ts`, re-run until exit 0. (GitHub `tree/` URLs and madewithml.com lesson slugs are the likely movers.)

- [ ] **Step 3: Commit**

```bash
git add backend/scripts/check-links.ts backend/src/db/seedData.ts
git commit -m "feat(backend): seed link checker — all 36 resource URLs verified live"
```

---

### Task 4: Reseed

**Files:**
- Modify: `backend/src/db/seed.ts`

- [ ] **Step 1: Rewrite seed.ts to use seedData**

Replace the existing mock-derived seeding with:

```typescript
import { prisma } from './client.js'
import { seedTexts, seedTasks } from './seedData.js'

async function main() {
  await prisma.chapterProgress.deleteMany()
  await prisma.textProgress.deleteMany()
  await prisma.taskProgress.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.sacredText.deleteMany()
  await prisma.task.deleteMany()

  for (const t of seedTexts) {
    const { chapters, ...text } = t
    const created = await prisma.sacredText.create({ data: text })
    await prisma.chapter.createMany({
      data: chapters.map((c) => ({ ...c, textId: created.id })),
    })
    console.log(`Seeded "${created.title}" with ${chapters.length} chapters`)
  }

  await prisma.task.createMany({ data: seedTasks })
  console.log(`Seeded ${seedTasks.length} tasks`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

- [ ] **Step 2: Run seed**

```powershell
cd backend
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/prometheon"
npx tsx src/db/seed.ts
```

Expected: 3 "Seeded ..." lines (12 chapters each) + "Seeded 15 tasks".

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/seed.ts
git commit -m "feat(backend): reseed from curated track data"
```

---

### Task 5: Texts API — chapters + progress

**Files:**
- Modify: `backend/src/routes/texts.ts`

- [ ] **Step 1: Rewrite the two handlers**

```typescript
import { Hono } from 'hono'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import { prisma } from '../db/client.js'

const texts = new Hono<{ Variables: AuthVariables }>()
texts.use('*', requireAuth)

// GET /api/texts — list with chapterCount + caller's progressPct
texts.get('/', async (c) => {
  const userId = c.get('userId')
  const all = await prisma.sacredText.findMany({
    include: {
      chapterList: { select: { id: true } },
    },
    orderBy: { title: 'asc' },
  })
  const done = await prisma.chapterProgress.findMany({ where: { userId }, select: { chapterId: true } })
  const doneSet = new Set(done.map((d) => d.chapterId))

  return c.json(
    all.map(({ chapterList, ...t }) => {
      const total = chapterList.length
      const completed = chapterList.filter((ch) => doneSet.has(ch.id)).length
      return {
        ...t,
        chapterCount: total,
        progressPct: total === 0 ? 0 : Math.floor((completed / total) * 100),
      }
    })
  )
})

// GET /api/texts/:id — detail with ordered chapters + per-user completed
texts.get('/:id', async (c) => {
  const userId = c.get('userId')
  const text = await prisma.sacredText.findUnique({
    where: { id: c.req.param('id') },
    include: { chapterList: { orderBy: { order: 'asc' } } },
  })
  if (!text) return c.json({ error: 'Sacred text not found' }, 404)

  const done = await prisma.chapterProgress.findMany({
    where: { userId, chapterId: { in: text.chapterList.map((ch) => ch.id) } },
    select: { chapterId: true },
  })
  const doneSet = new Set(done.map((d) => d.chapterId))
  const { chapterList, ...rest } = text

  return c.json({
    ...rest,
    chapters: chapterList.map((ch) => ({ ...ch, completed: doneSet.has(ch.id) })),
  })
})

export default texts
```

(Adjust to preserve any existing route options in the current file; the handlers above are the full intended behavior.)

- [ ] **Step 2: Verify**

```powershell
# with backend running and $token from /auth/login
Invoke-RestMethod http://localhost:3001/api/texts -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 3
```

Expected: 3 texts, each with `chapterCount: 12`, `progressPct: 0`. Then fetch one `id` and expect `chapters` array of 12 with `completed: false`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/texts.ts
git commit -m "feat(backend): texts API returns chapters, chapterCount, per-user progress"
```

---

### Task 6: Chapter toggle endpoint + TextProgress derivation

**Files:**
- Modify: `backend/src/routes/progress.ts`

**Does NOT cover:** un-completing a text manually — TextProgress is fully derived from chapter completion.

- [ ] **Step 1: Add the route**

Add to `progress.ts`:

```typescript
// PATCH /api/progress/chapters/:id/complete — toggle chapter, derive TextProgress
progress.patch('/chapters/:id/complete', async (c) => {
  const userId = c.get('userId')
  const chapterId = c.req.param('id')

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } })
  if (!chapter) return c.json({ error: 'Chapter not found' }, 404)

  const existing = await prisma.chapterProgress.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  })

  let completed: boolean
  if (existing) {
    await prisma.chapterProgress.delete({ where: { id: existing.id } })
    completed = false
  } else {
    await prisma.chapterProgress.create({ data: { userId, chapterId } })
    completed = true
  }

  // Derive TextProgress for the parent text
  const [total, done] = await Promise.all([
    prisma.chapter.count({ where: { textId: chapter.textId } }),
    prisma.chapterProgress.count({
      where: { userId, chapter: { textId: chapter.textId } },
    }),
  ])
  const pct = total === 0 ? 0 : Math.floor((done / total) * 100)
  const status = pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'not_started'

  await prisma.textProgress.upsert({
    where: { userId_textId: { userId, textId: chapter.textId } },
    create: {
      userId,
      textId: chapter.textId,
      status,
      progress: pct,
      completedAt: pct === 100 ? new Date() : null,
    },
    update: { status, progress: pct, completedAt: pct === 100 ? new Date() : null },
  })

  return c.json({ chapterId, completed, textProgressPct: pct })
})
```

- [ ] **Step 2: Verify toggle + derivation**

```powershell
# pick a chapter id from GET /api/texts/:id
Invoke-RestMethod -Method Patch "http://localhost:3001/api/progress/chapters/$chId/complete" -Headers @{Authorization="Bearer $token"}
```

Expected: `{ chapterId, completed: true, textProgressPct: 8 }` (1/12). Repeat → `completed: false, textProgressPct: 0`. `GET /api/progress` summary should reflect `in_progress` text after one toggle.

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/progress.ts
git commit -m "feat(backend): chapter complete toggle with derived TextProgress"
```

---

### Task 7: Frontend types + progressStore from API

**Files:**
- Modify: `frontend/src/shared/types/sacredText.ts`
- Modify: `frontend/src/shared/store/progressStore.ts`
- Delete: `frontend/src/data/mockTexts.ts`, `frontend/src/data/mockTasks.ts`

- [ ] **Step 1: Rewrite sacredText.ts**

```typescript
export interface Chapter {
  id: string
  order: number
  title: string
  summary: string
  resourceUrl: string
  resourceLabel: string
  estMinutes: number
  completed: boolean
}

export interface SacredText {
  id: string
  title: string
  author: string
  realm: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  coverEmoji: string
  attribution: string
  chapterCount?: number
  progressPct?: number
  chapters?: Chapter[]
}
```

- [ ] **Step 2: progressStore — fetch tasks from API**

Replace the `mockTasks` initialization: tasks start `[]`, add `fetchTasks` action calling `api.fetchTasks()` (Task type gains `completed` from a join against `GET /api/progress` or — simpler — keep the existing `toggleComplete` flow and set `completed: false` initially, then hydrate from `api.fetchProgress()` completions). Concrete shape:

```typescript
interface ProgressState {
  tasks: Task[]
  loading: boolean
  pendingId: string | null
  error: string | null
  fetchTasks: () => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  // keep existing selectors: completedCount(), totalPoints()
}

fetchTasks: async () => {
  set({ loading: true, error: null })
  try {
    const [tasks, progress] = await Promise.all([api.fetchTasks(), api.fetchProgress()])
    const completedIds = new Set<string>(
      (progress.completedTaskIds ?? progress.tasks ?? []).map((t: { taskId?: string; id?: string }) => t.taskId ?? t.id)
    )
    set({
      tasks: tasks.map((t: Task) => ({ ...t, completed: completedIds.has(t.id) })),
      loading: false,
    })
  } catch {
    set({ error: 'Failed to load tasks.', loading: false })
  }
},
```

**Check the actual `GET /api/progress` response shape in `backend/src/routes/progress.ts` first** and adapt the `completedIds` extraction to it — do not guess. Call `fetchTasks()` from `TasksPage` (useEffect on mount) and keep `DashboardPage` selectors working.

- [ ] **Step 3: Delete mock files, fix imports**

Delete `frontend/src/data/mockTexts.ts` and `frontend/src/data/mockTasks.ts`. Run `npx tsc --noEmit` and fix every import error (expected: progressStore, possibly type re-exports). The `Task` type moves to `shared/types/task.ts` if it was re-exported from mockTasks.

- [ ] **Step 4: Run tests + typecheck**

Run: `cd frontend; npx tsc --noEmit; npx vitest run`
Expected: tsc 0. The progressStore test suite will need updating: mock `api.fetchTasks`/`api.fetchProgress` with `vi.mock('../../services/api')` and assert hydration; keep toggle tests passing.

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "feat(frontend): real types + progressStore hydrates tasks from API; mocks deleted"
```

---

### Task 8: SacredTextsPage — progress cards

**Files:**
- Modify: `frontend/src/pages/SacredTextsPage.tsx` (and `TextCard` component it renders)

- [ ] **Step 1: Update card rendering**

Where the card currently shows `pages`, show instead:

```tsx
<div className="mt-3">
  <div className="flex justify-between text-xs text-gray-400 mb-1">
    <span>{text.chapterCount} chapters</span>
    <span>{text.progressPct ?? 0}%</span>
  </div>
  <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
    <div
      className="h-full bg-primary-500 rounded-full transition-all"
      style={{ width: `${text.progressPct ?? 0}%` }}
    />
  </div>
</div>
```

Remove any `text.pages` / `text.completed` references (gone from the type). Realm filter options should derive from the fetched texts' realms (3 realms now) if currently hardcoded.

- [ ] **Step 2: Verify visually + tests**

Run: `cd frontend; npx tsc --noEmit; npx vitest run` — expected green.
With both servers running: /sacred-texts shows 3 track cards with 0% bars.

- [ ] **Step 3: Commit**

```bash
git add frontend/src
git commit -m "feat(frontend): track cards with chapter count + progress bar"
```

---

### Task 9: SacredTextDetailPage — track hub (TDD)

**Files:**
- Create: `frontend/src/pages/SacredTextDetailPage.test.tsx`
- Modify: `frontend/src/pages/SacredTextDetailPage.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SacredTextDetailPage from './SacredTextDetailPage'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    fetchTextById: vi.fn(),
    toggleChapter: vi.fn(),
  },
}))

const mockText = {
  id: 't1',
  title: 'The Flame of Prometheus',
  author: 'Foundations of Artificial Intelligence',
  realm: 'Prometheon',
  description: 'desc',
  difficulty: 'Beginner',
  coverEmoji: '🔥',
  attribution: 'Based on Microsoft "AI For Beginners"',
  chapters: [
    { id: 'c1', order: 1, title: 'What is AI?', summary: 's1', resourceUrl: 'https://example.com/1', resourceLabel: 'Lesson 1', estMinutes: 45, completed: false },
    { id: 'c2', order: 2, title: 'History of AI', summary: 's2', resourceUrl: 'https://example.com/2', resourceLabel: 'Lesson 2', estMinutes: 30, completed: true },
  ],
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/sacred-texts/t1']}>
      <Routes>
        <Route path="/sacred-texts/:id" element={<SacredTextDetailPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('SacredTextDetailPage', () => {
  beforeEach(() => {
    vi.mocked(api.fetchTextById).mockResolvedValue(mockText)
  })

  it('renders chapter list with lesson links', async () => {
    renderPage()
    expect(await screen.findByText('What is AI?')).toBeInTheDocument()
    const link = screen.getAllByRole('link', { name: /open lesson/i })[0]
    expect(link).toHaveAttribute('href', 'https://example.com/1')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows progress derived from completed chapters', async () => {
    renderPage()
    expect(await screen.findByText('50%')).toBeInTheDocument()
  })

  it('toggles a chapter optimistically', async () => {
    vi.mocked(api.toggleChapter).mockResolvedValue({ chapterId: 'c1', completed: true, textProgressPct: 100 })
    renderPage()
    const checkbox = (await screen.findAllByRole('checkbox'))[0]
    fireEvent.click(checkbox)
    await waitFor(() => expect(api.toggleChapter).toHaveBeenCalledWith('c1'))
    expect(await screen.findByText('100%')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `cd frontend; npx vitest run src/pages/SacredTextDetailPage.test.tsx`
Expected: FAIL (`api.toggleChapter` doesn't exist; page renders no chapters).

- [ ] **Step 3: Add `toggleChapter` to api.ts**

```typescript
async toggleChapter(chapterId: string) {
  const { data } = await client.patch(`/api/progress/chapters/${chapterId}/complete`)
  return data
},
```

- [ ] **Step 4: Rewrite SacredTextDetailPage.tsx**

Keep the existing loading/error/retry skeleton. Replace the card body with the track hub:

```tsx
// inside the success render, after fetching `text` (with chapters)
const chapters = text.chapters ?? []
const doneCount = chapters.filter((ch) => ch.completed).length
const pct = chapters.length ? Math.floor((doneCount / chapters.length) * 100) : 0

const handleToggle = async (chapterId: string) => {
  // optimistic flip
  setText((t) => t && {
    ...t,
    chapters: t.chapters?.map((ch) => (ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch)),
  })
  try {
    await api.toggleChapter(chapterId)
  } catch {
    // rollback
    setText((t) => t && {
      ...t,
      chapters: t.chapters?.map((ch) => (ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch)),
    })
  }
}
```

Render: header (coverEmoji, title, author-as-subtitle, attribution in small gray text, difficulty + realm badges), progress bar with `{pct}%` label, then the ordered chapter list — each row: checkbox (`aria-label` = chapter title, checked = completed, onChange = handleToggle), title + summary + `~{estMinutes} min`, and an external link `Open lesson ↗` (`href=resourceUrl`, `target="_blank"`, `rel="noreferrer"`). Below the list, a button "Ask the assistant about this track" calling `useChatStore.getState().openChat(text.id, 'text')`.

- [ ] **Step 5: Run tests to verify pass**

Run: `cd frontend; npx vitest run`
Expected: all suites PASS (including the 3 new tests).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/SacredTextDetailPage.tsx frontend/src/pages/SacredTextDetailPage.test.tsx frontend/src/services/api.ts
git commit -m "feat(frontend): track hub detail page — chapter checklist, optimistic toggle, chat context"
```

---

### Task 10: End-to-End Verification

**Files:** none (verification only)

- [ ] **Step 1: Full static + test pass**

```powershell
cd backend; npx tsc --noEmit
cd ..\frontend; npx tsc --noEmit; npx vitest run; npm run build
```

Expected: all exit 0 (vitest exit 1 acceptable only for the known pre-existing SearchForm unhandled error; all tests green).

- [ ] **Step 2: Live walkthrough**

Both servers running, logged in:
1. /sacred-texts → 3 track cards, 12 chapters each, 0% bars
2. Open The Flame of Prometheus → 12 chapters, tick 2 → bar shows 16%, links open lessons in new tab
3. Reload → progress persisted
4. Dashboard → text shows in-progress
5. /tasks → 15 real exercises, complete one → points update
6. ⚡ chat from the detail page → assistant references the track (context wired)

- [ ] **Step 3: Final commit (if any fixups) and report**

```bash
git status   # clean or commit fixups with descriptive messages
```

---

## Self-Review Checklist

- [x] **Spec coverage:** schema ✓ (T1), seed content ✓ (T2), link verification ✓ (T3), reseed ✓ (T4), texts API ✓ (T5), toggle + TextProgress derivation ✓ (T6), types + progressStore + mock deletion ✓ (T7), list page ✓ (T8), detail hub + chat context ✓ (T9), E2E ✓ (T10)
- [x] **No placeholders:** all code blocks complete; T7 Step 2 explicitly instructs checking the real `/api/progress` shape instead of guessing
- [x] **Type consistency:** `chapterList` relation name used in schema + texts route; `toggleChapter` defined in T9 Step 3 and used in tests; `Chapter.completed` exists only in API shape (frontend type), not the Prisma model — intentional
