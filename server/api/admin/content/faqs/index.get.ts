import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } })
})
