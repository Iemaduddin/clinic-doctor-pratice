import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { faqSchema } from '~~/shared/validation/content'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, faqSchema)

  try {
    const faq = await prisma.faq.create({ data })
    await logAdminAction(event, 'CREATE', 'FAQ', faq.id, '')
    setResponseStatus(event, 201)
    return faq
  } catch (error) {
    throwPrismaError(error)
  }
})
