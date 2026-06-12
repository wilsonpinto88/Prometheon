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
