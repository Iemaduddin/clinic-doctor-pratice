import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.doctor.findMany({
    orderBy: { name: 'asc' },
    include: {
      specialization: true,
      schedules: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }
    }
  })
})
