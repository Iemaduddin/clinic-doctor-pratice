import { prisma } from '~~/lib/prisma'
import { appointmentStatusSchema, assertStatusTransition } from '~~/server/utils/appointment-status'
import { requireDoctorProfile } from '~~/server/utils/doctor'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { parseBody } from '~~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const doctor = await requireDoctorProfile(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const body = await parseBody(event, appointmentStatusSchema)
  const appointment = await prisma.appointment.findUnique({ where: { id }, select: { doctorId: true, status: true } })
  if (!appointment || appointment.doctorId !== doctor.id) {
    throw createError({ statusCode: 404, statusMessage: 'Reservasi tidak ditemukan' })
  }

  const next = body.status
  assertStatusTransition(appointment.status, next)

  try {
    return await prisma.appointment.update({
      where: { id },
      data: {
        status: next,
        ...(next === 'CANCELLED' ? { activeSlotKey: null } : {})
      },
      include: {
        service: { select: { name: true } },
        patient: { select: { name: true, phone: true } }
      }
    })
  } catch (error) {
    throwPrismaError(error)
  }
})
