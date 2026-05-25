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
