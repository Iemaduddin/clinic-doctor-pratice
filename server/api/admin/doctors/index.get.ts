import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { getPagination, paginate } from '~~/server/utils/pagination'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const search = String(query.search || '').trim()
  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}
  const include = {
    specialization: true,
    schedules: { orderBy: [{ dayOfWeek: 'asc' as const }, { startTime: 'asc' as const }] }
  }
  if (String(query.all || '') === '1') {
    return prisma.doctor.findMany({ where, orderBy: { name: 'asc' }, include })
  }
  const { page, pageSize, skip, take } = getPagination(event)
  const [items, total] = await prisma.$transaction([
    prisma.doctor.findMany({ where, orderBy: { name: 'asc' }, include, skip, take }),
    prisma.doctor.count({ where })
  ])
  return paginate(items, total, page, pageSize)
})
