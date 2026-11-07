import { prisma } from '~~/lib/prisma'
import { isWithinOpenRanges, overlapsAnyRange, timeToMinutes } from '~~/server/utils/schedule-exceptions'
import { publicBookingSchema } from '~~/shared/validation/booking'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { parseBody } from '~~/server/utils/validation'

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KS-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default defineEventHandler(async (event) => {
  const data = await parseBody(event, publicBookingSchema)

  // Verify doctor
  const doctor = await prisma.doctor.findFirst({
    where: { id: data.doctorId, isActive: true }
  })
  if (!doctor) {
    throw createError({ statusCode: 404, statusMessage: 'Dokter tidak ditemukan atau tidak aktif' })
  }

  // Verify service
  const service = await prisma.medicalService.findFirst({
    where: { id: data.serviceId, isActive: true }
  })
  if (!service) {
    throw createError({ statusCode: 404, statusMessage: 'Layanan medis tidak ditemukan atau tidak aktif' })
  }

  // Parse startAt & endAt
  const startAt = new Date(`${data.date}T${data.startTime}:00+07:00`)
  if (isNaN(startAt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Tanggal atau jam tidak valid' })
  }

  if (startAt.getTime() <= Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'Waktu reservasi harus di masa mendatang' })
  }

  const durationMs = (service.durationMinutes || doctor.slotDurationMinutes) * 60 * 1000
  const endAt = new Date(startAt.getTime() + durationMs)
  const activeSlotKey = `${doctor.id}_${startAt.toISOString()}`

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      const date = new Date(`${data.date}T00:00:00.000Z`)
      const dayOfWeek = new Date(`${data.date}T12:00:00+07:00`).getUTCDay()
      const startMinutes = timeToMinutes(data.startTime)
      const endMinutes = startMinutes + durationMs / 60000
      const [weeklySchedules, exceptions] = await Promise.all([
        tx.doctorSchedule.findMany({ where: { doctorId: doctor.id, dayOfWeek, isActive: true }, select: { startTime: true, endTime: true } }),
        tx.doctorScheduleException.findMany({ where: { doctorId: doctor.id, date }, select: { kind: true, startTime: true, endTime: true } })
      ])
      const openRanges = [
        ...weeklySchedules,
        ...exceptions.filter((item) => item.kind === 'OPEN' && item.startTime && item.endTime).map((item) => ({ startTime: item.startTime!, endTime: item.endTime! }))
      ]
      const closedRanges = exceptions.filter((item) => item.kind === 'CLOSED')
      const fullDayClosed = closedRanges.some((item) => !item.startTime && !item.endTime)
      const closedIntervals = closedRanges.filter((item) => item.startTime && item.endTime).map((item) => ({ startTime: item.startTime!, endTime: item.endTime! }))
      if (fullDayClosed || !isWithinOpenRanges(startMinutes, endMinutes, openRanges, doctor.slotDurationMinutes) || overlapsAnyRange(startMinutes, endMinutes, closedIntervals)) {
        throw createError({ statusCode: 409, statusMessage: 'Waktu reservasi tidak tersedia. Silakan pilih slot lain.' })
      }
      const overlappingAppointment = await tx.appointment.findFirst({
        where: { doctorId: doctor.id, status: { in: ['PENDING', 'CONFIRMED'] }, startAt: { lt: endAt }, endAt: { gt: startAt } },
        select: { id: true }
      })
      if (overlappingAppointment) throw createError({ statusCode: 409, statusMessage: 'Slot waktu ini baru saja dipesan pasien lain. Silakan pilih waktu lain.' })

      // Find or create patient by phone
      let patient = await tx.patient.findFirst({
        where: { phone: data.patientPhone }
      })

      if (!patient) {
        patient = await tx.patient.create({
          data: {
            name: data.patientName,
            phone: data.patientPhone,
            email: data.patientEmail
          }
        })
      } else if (data.patientEmail && !patient.email) {
        // Update patient email if previously missing
        patient = await tx.patient.update({
          where: { id: patient.id },
          data: { email: data.patientEmail }
        })
      }

      // Check slot availability
      const existing = await tx.appointment.findFirst({
        where: {
          activeSlotKey,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      })
      if (existing) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Slot waktu ini baru saja dipesan oleh pasien lain. Silakan pilih waktu lain.'
        })
      }

      // Generate unique booking code
      let bookingCode = generateBookingCode()
      let attempts = 0
      while (await tx.appointment.findUnique({ where: { bookingCode } })) {
        bookingCode = generateBookingCode()
        attempts++
        if (attempts > 5) throw createError({ statusCode: 500, statusMessage: 'Gagal membuat kode reservasi' })
      }

      return tx.appointment.create({
        data: {
          bookingCode,
          doctorId: doctor.id,
          serviceId: service.id,
          patientId: patient.id,
          startAt,
          endAt,
          status: 'PENDING',
          activeSlotKey,
          note: data.note
        },
        include: {
          doctor: { select: { name: true, photoUrl: true } },
          service: { select: { name: true, durationMinutes: true } },
          patient: { select: { name: true, phone: true, email: true } }
        }
      })
    })

    setResponseStatus(event, 201)
    return appointment
  } catch (error) {
    throwPrismaError(error)
  }
})
