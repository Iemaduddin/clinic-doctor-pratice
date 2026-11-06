import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { doctorSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })
  const data = await parseBody(event, doctorSchema)
  try {
    return await prisma.doctor.update({
      where: { id },
      data: data as never,
      include: { specialization: true, schedules: true }
    })
  } catch (error) {
    throwPrismaError(error)
  }
})
