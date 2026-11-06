import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const statusFilter = String(query.status || '').trim()

  const whereCondition = statusFilter && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(statusFilter)
    ? { status: statusFilter as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }
    : {}

  return prisma.appointment.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: {
      doctor: { select: { name: true, specialization: { select: { name: true } } } },
      service: { select: { name: true, durationMinutes: true } },
      patient: { select: { name: true, phone: true, email: true } }
    }
  })
})
