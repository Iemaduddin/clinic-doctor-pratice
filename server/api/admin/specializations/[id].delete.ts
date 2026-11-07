import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  try {
    await prisma.specialization.delete({ where: { id } })
    await logAdminAction(event, 'DELETE', 'SPECIALIZATION', id, '')
    return { deleted: true }
  } catch (error) {
    throwPrismaError(error)
  }
})
