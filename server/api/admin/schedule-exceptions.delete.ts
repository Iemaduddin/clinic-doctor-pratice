import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { logAdminAction } from '~~/server/utils/audit-log'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await readBody<{ id?: string }>(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })
  try {
    await prisma.doctorScheduleException.delete({ where: { id } })
    await logAdminAction(event, 'DELETE', 'SCHEDULE_EXCEPTION', id, '')
    return { deleted: true }
  } catch (error) {
    throwPrismaError(error)
  }
})
