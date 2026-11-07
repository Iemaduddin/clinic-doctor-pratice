import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  try {
    await prisma.clinicFacility.delete({ where: { id } })
    await logAdminAction(event, 'DELETE', 'FACILITY', id, '')
    return { deleted: true }
  } catch (error) {
    throwPrismaError(error)
  }
})
