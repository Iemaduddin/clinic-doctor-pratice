import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.doctorSchedule.findMany({
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    include: { doctor: { select: { id: true, name: true, isActive: true } } }
  })
})
