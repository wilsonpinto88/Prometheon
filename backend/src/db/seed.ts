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
    title: "You Don't Know JS",
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
