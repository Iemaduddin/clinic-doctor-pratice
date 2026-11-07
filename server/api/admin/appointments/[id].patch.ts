import { prisma } from '~~/lib/prisma'
import { appointmentStatusSchema, assertStatusTransition } from '~~/server/utils/appointment-status'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { logAdminAction } from '~~/server/utils/audit-log'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const body = await parseBody(event, appointmentStatusSchema)

  const appointment = await prisma.appointment.findUnique({ where: { id } })
  if (!appointment) throw createError({ statusCode: 404, statusMessage: 'Reservasi tidak ditemukan' })

  const next = body.status
  assertStatusTransition(appointment.status, next)

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: next,
        // Clear activeSlotKey if cancelled so slot becomes free again
        ...(next === 'CANCELLED' ? { activeSlotKey: null } : {})
      },
      include: {
        doctor: { select: { name: true } },
        service: { select: { name: true } },
        patient: { select: { name: true, phone: true } }
      }
    })

    await logAdminAction(event, 'UPDATE', 'APPOINTMENT', id, '')
    return updated
  } catch (error) {
    throwPrismaError(error)
  }
})
