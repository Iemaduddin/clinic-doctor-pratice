import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { getPagination, paginate } from '~~/server/utils/pagination'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const statusFilter = String(query.status || '').trim()
  const search = String(query.search || '').trim()
  const { page, pageSize, skip, take } = getPagination(event)

  const where = {
    ...(statusFilter && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(statusFilter)
      ? { status: statusFilter as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }
      : {}),
    ...(search
      ? {
          OR: [
            { bookingCode: { contains: search, mode: 'insensitive' as const } },
            { patient: { name: { contains: search, mode: 'insensitive' as const } } },
            { patient: { phone: { contains: search, mode: 'insensitive' as const } } }
          ]
        }
      : {})
  }

  const [items, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        doctor: { select: { name: true, specialization: { select: { name: true } } } },
        service: { select: { name: true, durationMinutes: true } },
        patient: { select: { name: true, phone: true, email: true } }
      }
    }),
    prisma.appointment.count({ where })
  ])

  return paginate(items, total, page, pageSize)
})
