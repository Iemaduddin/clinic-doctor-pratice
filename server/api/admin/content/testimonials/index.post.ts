import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { testimonialSchema } from '~~/shared/validation/content'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, testimonialSchema)

  try {
    const testimonial = await prisma.testimonial.create({ data })
    await logAdminAction(event, 'CREATE', 'TESTIMONIAL', testimonial.id, '')
    setResponseStatus(event, 201)
    return testimonial
  } catch (error) {
    throwPrismaError(error)
  }
})
