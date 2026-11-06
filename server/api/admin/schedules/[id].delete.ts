import { prisma } from '~~/lib/prisma'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  try {
    await prisma.doctorSchedule.delete({ where: { id } })
    return { deleted: true }
  } catch (error) {
    throwPrismaError(error)
  }
})
