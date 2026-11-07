import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { facilitySchema } from '~~/shared/validation/content'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const data = await parseBody(event, facilitySchema)

  try {
    const facility = await prisma.clinicFacility.update({ where: { id }, data })
    await logAdminAction(event, 'UPDATE', 'FACILITY', id, '')
    return facility
  } catch (error) {
    throwPrismaError(error)
  }
})
