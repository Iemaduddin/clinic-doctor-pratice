import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.medicalService.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      durationMinutes: true
    }
  })
})
