import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const date = String(getQuery(event).date || '')
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Format tanggal tidak valid' })
  }
  const targetDate = date ? new Date(`${date}T00:00:00.000Z`) : undefined
  if (targetDate && targetDate.toISOString().slice(0, 10) !== date) {
    throw createError({ statusCode: 400, statusMessage: 'Tanggal tidak valid' })
  }
  return prisma.doctorScheduleException.findMany({
    where: targetDate ? { date: targetDate } : {},
    orderBy: [{ doctor: { name: 'asc' } }, { startTime: 'asc' }],
    include: { doctor: { select: { id: true, name: true } } }
  })
})
