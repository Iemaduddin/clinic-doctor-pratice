import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { specializationSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { uniqueSlug } from '~~/server/utils/slug'
import { parseBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, specializationSchema)
  const slug = await uniqueSlug(data.name, async (candidate) => {
    return Boolean(await prisma.specialization.findUnique({ where: { slug: candidate } }))
  })

  try {
    const specialization = await prisma.specialization.create({ data: { ...data, slug } })
    await logAdminAction(event, 'CREATE', 'SPECIALIZATION', specialization.id, '')
    setResponseStatus(event, 201)
    return specialization
  } catch (error) {
    throwPrismaError(error)
  }
})
