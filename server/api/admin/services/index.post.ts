import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { serviceSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { uniqueSlug } from '~~/server/utils/slug'
import { parseBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, serviceSchema)
  const slug = await uniqueSlug(data.name, async (candidate) => {
    return Boolean(await prisma.medicalService.findUnique({ where: { slug: candidate } }))
  })

  try {
    const service = await prisma.medicalService.create({ data: { ...data, slug } })
    await logAdminAction(event, 'CREATE', 'SERVICE', service.id, '')
    setResponseStatus(event, 201)
    return service
  } catch (error) {
    throwPrismaError(error)
  }
})
