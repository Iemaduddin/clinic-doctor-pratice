import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { facilitySchema } from '~~/shared/validation/content'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, facilitySchema)

  try {
    const facility = await prisma.clinicFacility.create({ data })
    await logAdminAction(event, 'CREATE', 'FACILITY', facility.id, '')
    setResponseStatus(event, 201)
    return facility
  } catch (error) {
    throwPrismaError(error)
  }
})
