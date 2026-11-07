import { prisma } from '~~/lib/prisma'
import { accountProfileSchema } from '~~/shared/validation/account'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAuth } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await parseBody(event, accountProfileSchema)

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: body.name, phone: body.phone },
      select: { id: true, name: true, email: true, phone: true, role: true }
    })
    return { user }
  } catch (error) {
    throwPrismaError(error)
  }
})
