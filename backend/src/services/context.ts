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
    const text = await prisma.sacredText.findUnique({
      where: { id: contextEntityId },
      include: { _count: { select: { chapterList: true } } },
    })
    if (text) {
      currentEntityContext = `\nCurrently viewing book: "${text.title}" by ${text.author} (${text.difficulty}, ${text._count.chapterList} chapters)\n${text.description}`
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
