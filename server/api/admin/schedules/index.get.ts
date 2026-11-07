import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { getPagination, paginate } from '~~/server/utils/pagination'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  if (getQuery(event).all === '1') {
    return prisma.doctorSchedule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: { doctor: { select: { id: true, name: true, isActive: true } } }
    })
  }
  const { page, pageSize, skip, take } = getPagination(event)
  const [items, total] = await prisma.$transaction([
    prisma.doctorSchedule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: { doctor: { select: { id: true, name: true, isActive: true } } },
      skip,
      take
    }),
    prisma.doctorSchedule.count()
  ])
  return paginate(items, total, page, pageSize)
})
