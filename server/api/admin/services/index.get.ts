import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { getPagination, paginate } from '~~/server/utils/pagination'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const search = String(getQuery(event).search || '').trim()
  const { page, pageSize, skip, take } = getPagination(event)
  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}
  const [items, total] = await prisma.$transaction([
    prisma.medicalService.findMany({ where, orderBy: { name: 'asc' }, skip, take }),
    prisma.medicalService.count({ where })
  ])
  return paginate(items, total, page, pageSize)
})
