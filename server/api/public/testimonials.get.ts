import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, patientName: true, content: true, rating: true }
  })
})
