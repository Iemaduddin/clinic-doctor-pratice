import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { scheduleSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, scheduleSchema)

  try {
    const schedule = await prisma.doctorSchedule.create({
      data,
      include: { doctor: { select: { id: true, name: true, isActive: true } } }
    })
    await logAdminAction(event, 'CREATE', 'SCHEDULE', schedule.id, '')
    setResponseStatus(event, 201)
    return schedule
  } catch (error) {
    throwPrismaError(error)
  }
})
