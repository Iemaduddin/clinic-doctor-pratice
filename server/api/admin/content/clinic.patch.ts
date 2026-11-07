import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { clinicProfileSchema } from '~~/shared/validation/content'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { logAdminAction } from '~~/server/utils/audit-log'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, clinicProfileSchema)

  try {
    const profile = await prisma.clinicProfile.update({ where: { id: 'default' }, data })
    await logAdminAction(event, 'UPDATE', 'CLINIC_PROFILE', 'default', '')
    return profile
  } catch (error) {
    throwPrismaError(error)
  }
})
