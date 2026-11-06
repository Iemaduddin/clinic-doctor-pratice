import { prisma } from '~~/lib/prisma'
import { serviceSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const data = await parseBody(event, serviceSchema)

  try {
    return await prisma.medicalService.update({ where: { id }, data })
  } catch (error) {
    throwPrismaError(error)
  }
})
