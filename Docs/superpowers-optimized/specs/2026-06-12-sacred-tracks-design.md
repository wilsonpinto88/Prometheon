# Sacred Tracks — Real Open-Source Learning Material Design

**Date:** 2026-06-12
**Status:** Approved
**Replaces:** the 10 mock book entries and 9 mock tasks seeded from `frontend/src/data/mockTexts.ts` / `mockTasks.ts`.

## Goal

Replace mock Sacred Texts with **3 in-depth learning tracks** backed by real, free, open-source material, with per-chapter progress tracking and real exercises as Tasks.

## Scope

- New `Chapter` and `ChapterProgress` Prisma models + migration.
- Reseed: 3 SacredTexts with ~12 curated chapters each; 15 real exercise Tasks (5 per track).
- Backend: texts endpoints return chapters + progress; new chapter-complete toggle endpoint.
- Frontend: SacredTextDetailPage becomes a track hub (chapter checklist, progress bar, lesson links, AI-context button); type alignment.

## Non-Goals

- Embedding lesson content in-app (we link out; summaries are our own words).
- Preserving existing seeded texts/tasks or user progress (reseed wipes them — dev DB).
- Automatic sync with upstream courses (link rot fixed by reseeding).
- Per-chapter quizzes/assessments (future).

## The Three Tracks

| # | Title | Realm | Difficulty | Primary source (license) |
|---|-------|-------|------------|--------------------------|
| 1 | **The Flame of Prometheus** — Foundations of Artificial Intelligence | Prometheon | Beginner→Intermediate | Microsoft *AI For Beginners* (MIT, github.com/microsoft/AI-For-Beginners) |
| 2 | **The Loom of the Fates** — Mastering Machine Learning | Asgard | Intermediate | Google *ML Crash Course* (CC-BY) + *Dive into Deep Learning* (d2l.ai, open book) |
| 3 | **The Forge of Olympus** — Cloud Infrastructure for AI | Olympus | Intermediate→Advanced | *Made With ML* (MIT, madewithml.com / github.com/GokuMohandas/Made-With-ML) |

Each text stores an `attribution` line crediting the source. All resource URLs are **verified live (HTTP 200) during implementation** before seeding; broken ones get replaced with the nearest equivalent lesson.

### Track 1 — The Flame of Prometheus (~12 chapters)

Curated from AI-For-Beginners lessons: Intro to AI → History of AI → Symbolic AI & expert systems → Intro to neural networks (perceptron) → Multi-layer networks & frameworks → Computer vision intro & CNNs → NLP intro (embeddings) → Language modeling & transformers → Genetic algorithms → Reinforcement learning → AI ethics → Generative AI outlook. Each chapter: our 1–2 sentence summary + link to the lesson folder.

### Track 2 — The Loom of the Fates (~12 chapters)

Phase A (fundamentals, Google MLCC): Intro to ML → Linear regression & loss → Gradient descent → Classification → Generalization, train/val/test → Feature engineering.
Phase B (depth, d2l.ai): Linear neural networks → Multilayer perceptrons → CNNs → RNNs & sequence models → Attention & Transformers → Optimization algorithms.

### Track 3 — The Forge of Olympus (~12 chapters)

From Made With ML (design → develop → deploy → iterate): ML system design → Data engineering & pipelines → Training at scale / experiment tracking → Evaluation & testing ML systems → Model serving (APIs) → Containerization (Docker) → Orchestration (Airflow-style jobs) → CI/CD for ML → Monitoring & observability → Data/feature stores → Infrastructure as Code for ML → Scaling & cost in the cloud.

### Tasks (15 total, 5 per track)

Exercises drawn from the source materials' own labs/assignments, e.g.:
- Flame: build a perceptron from scratch; train a CNN on MNIST; implement tic-tac-toe minimax; word embeddings exploration; simple genetic algorithm.
- Loom: linear regression by hand (MLCC exercise); feature-engineering lab; MLP from scratch (d2l); train & regularize a CNN; implement attention scoring.
- Forge: serve a model behind a FastAPI endpoint; dockerize a training job; write tests for an ML pipeline; set up experiment tracking; monitor a deployed model (drift check).

Fields: realm = track's realm, type = Coding/Research, difficulty Easy/Medium/Hard, points 100–500 scaled by difficulty.

## Schema

```prisma
model Chapter {
  id            String  @id @default(cuid())
  textId        String
  order         Int
  title         String
  summary       String
  resourceUrl   String
  resourceLabel String          // e.g. "AI For Beginners — Lesson 3"
  estMinutes    Int     @default(30)
  text          SacredText @relation(fields: [textId], references: [id], onDelete: Cascade)
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

`SacredText` gains `attribution String @default("")`. `chapters Int` count column is removed in favor of the relation (API returns `chapterCount`).

**TextProgress stays** and becomes maintained automatically: when a chapter toggle brings a text to 100% completed chapters, set `TextProgress.status = "completed"` (and back to `"in_progress"`/`"not_started"` when it drops). `progress` int = floor(% chapters done). Dashboard stats and AI context builder keep working unchanged.

## API Contract

- `GET /api/texts` → `[{ ...text, chapterCount, progressPct }]` (progressPct from caller's ChapterProgress)
- `GET /api/texts/:id` → `{ ...text, chapters: [{ id, order, title, summary, resourceUrl, resourceLabel, estMinutes, completed }] }`
- `PATCH /api/progress/chapters/:id/complete` → toggle; returns `{ chapterId, completed, textProgressPct }`; updates TextProgress as above. Auth required (all three).

Errors: 404 unknown chapter/text; 401 unauthenticated (existing middleware).

## Frontend

- `SacredTextsPage`: cards show progress bar (progressPct) + chapterCount; realm filter still works (now 3 realms).
- `SacredTextDetailPage`: track hub — header (title, attribution, difficulty, progress bar), ordered chapter list; each row: checkbox (optimistic toggle, rollback on error — same pattern as progressStore), title, summary, est minutes, "Open lesson ↗" external link.
- "Ask the assistant" button on detail page → `openChat(text.id, 'text')` (context plumbing already exists end-to-end).
- `shared/types/sacredText.ts` aligned to API shape (drop `pages`/`completed`; add chapters/progress fields). `mockTexts.ts`/`mockTasks.ts` deleted (seed becomes the only data source, moved to backend seed file).

## Testing Strategy

- Frontend: RTL tests for chapter checklist rendering + optimistic toggle rollback; existing suites stay green.
- Backend: manual curl verification per endpoint (no backend harness yet — unchanged constraint).
- Seed verification step: script asserts every `resourceUrl` returns HTTP 200 before declaring done.

## Migration / Rollout

1. Prisma migration (additive + drop `SacredText.chapters` column).
2. Reseed wipes SacredText/Task rows (cascades TextProgress/TaskProgress/ChapterProgress). Accepted: dev DB, single real user.
3. Frontend deployed together (type changes are breaking against old API shape).

## Failure Modes (assessed)

- **Link rot** — URLs only in seed; verified at seed time; reseed to fix. *Minor, accepted.*
- **Progress wipe on reseed** — accepted (dev). *Documented.*
- **Licensing** — link + own-words summaries only; attribution per text. MIT/CC sources. *Minor.*
- **Mixed ML sources (MLCC + d2l)** — ordered as fundamentals→depth phases to stay coherent. *Mitigated by design.*
