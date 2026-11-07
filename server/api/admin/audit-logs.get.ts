import { prisma } from '~~/lib/prisma'
import { getPagination, paginate } from '~~/server/utils/pagination'
import { requireRole } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['SUPER_ADMIN', 'CLINIC_ADMIN'])
  const { page, pageSize, skip, take } = getPagination(event)
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ skip, take, orderBy: { createdAt: 'desc' }, select: { actorName: true, action: true, entity: true, summary: true, createdAt: true } }),
    prisma.auditLog.count()
  ])
  return paginate(logs, total, page, pageSize)
})
