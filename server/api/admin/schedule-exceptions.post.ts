import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { scheduleExceptionSchema } from '~~/shared/validation/admin'
import { logAdminAction } from '~~/server/utils/audit-log'
import { throwPrismaError } from '~~/server/utils/prisma-error'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, scheduleExceptionSchema)
  const doctor = await prisma.doctor.findFirst({ where: { id: data.doctorId, isActive: true }, select: { id: true } })
  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Dokter tidak ditemukan atau tidak aktif' })

  if (data.kind === 'CLOSED') {
    const dayStart = new Date(`${data.date}T00:00:00+07:00`)
    const dayEnd = new Date(`${data.date}T00:00:00+07:00`)
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1)
    const startAt = data.startTime ? new Date(`${data.date}T${data.startTime}:00+07:00`) : dayStart
    const endAt = data.endTime ? new Date(`${data.date}T${data.endTime}:00+07:00`) : dayEnd
    const conflicting = await prisma.appointment.findFirst({
      where: { doctorId: doctor.id, status: { in: ['PENDING', 'CONFIRMED'] }, startAt: { lt: endAt }, endAt: { gt: startAt } },
      select: { id: true }
    })
    if (conflicting) throw createError({ statusCode: 409, statusMessage: 'Ada reservasi aktif pada rentang waktu ini.' })
  }

  try {
    const exception = await prisma.doctorScheduleException.create({ data: { ...data, date: new Date(`${data.date}T00:00:00.000Z`) } })
    await logAdminAction(event, 'CREATE', 'SCHEDULE_EXCEPTION', exception.id, '')
    setResponseStatus(event, 201)
    return exception
  } catch (error) {
    throwPrismaError(error)
  }
})
