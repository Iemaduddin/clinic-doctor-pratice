import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { faqSchema } from '~~/shared/validation/content'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const data = await parseBody(event, faqSchema)

  try {
    const faq = await prisma.faq.update({ where: { id }, data })
    await logAdminAction(event, 'UPDATE', 'FAQ', id, '')
    return faq
  } catch (error) {
    throwPrismaError(error)
  }
})
