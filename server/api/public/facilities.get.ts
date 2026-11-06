import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.clinicFacility.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, description: true, imageUrl: true }
  })
})
