import { prisma } from '~~/lib/prisma'
import { requireDoctorProfile } from '~~/server/utils/doctor'

export default defineEventHandler(async (event) => {
  const doctor = await requireDoctorProfile(event)
  const query = getQuery(event)
  const status = String(query.status || '').trim()

  return prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      ...(status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)
        ? { status: status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }
        : {})
    },
    orderBy: { startAt: 'desc' },
    include: {
      service: { select: { name: true, durationMinutes: true } },
      patient: { select: { name: true, phone: true, email: true } }
    }
  })
})
