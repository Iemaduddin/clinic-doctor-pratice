import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { testimonialSchema } from '~~/shared/validation/content'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const data = await parseBody(event, testimonialSchema)

  try {
    const testimonial = await prisma.testimonial.update({ where: { id }, data })
    await logAdminAction(event, 'UPDATE', 'TESTIMONIAL', id, '')
    return testimonial
  } catch (error) {
    throwPrismaError(error)
  }
})
