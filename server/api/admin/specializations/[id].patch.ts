import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { specializationSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const data = await parseBody(event, specializationSchema)
  const slug = data.name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'

  try {
    const result = await prisma.specialization.update({ where: { id }, data: { ...data, slug } })
    await logAdminAction(event, 'UPDATE', 'SPECIALIZATION', id, '')
    return result
  } catch (error) {
    throwPrismaError(error)
  }
})
