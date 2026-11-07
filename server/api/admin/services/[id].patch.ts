import { prisma } from '~~/lib/prisma'
import { serviceSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { logAdminAction } from '~~/server/utils/audit-log'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const data = await parseBody(event, serviceSchema)

  try {
    const result = await prisma.medicalService.update({ where: { id }, data })
    await logAdminAction(event, 'UPDATE', 'SERVICE', id, '')
    return result
  } catch (error) {
    throwPrismaError(error)
  }
})
