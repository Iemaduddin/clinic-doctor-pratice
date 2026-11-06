import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, question: true, answer: true }
  })
})
