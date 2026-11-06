import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Kode reservasi wajib diisi' })

  const appointment = await prisma.appointment.findUnique({
    where: { bookingCode: code },
    include: {
      doctor: { select: { name: true, photoUrl: true, specialization: { select: { name: true } } } },
      service: { select: { name: true, durationMinutes: true } },
      patient: { select: { name: true, phone: true, email: true } }
    }
  })

  if (!appointment) {
    throw createError({ statusCode: 404, statusMessage: 'Reservasi tidak ditemukan' })
  }

  return appointment
})
