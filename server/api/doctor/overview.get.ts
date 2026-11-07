import { prisma } from '~~/lib/prisma'
import { requireDoctorProfile } from '~~/server/utils/doctor'

export default defineEventHandler(async (event) => {
  const profile = await requireDoctorProfile(event)
  const [doctor, counts, upcoming] = await Promise.all([
    prisma.doctor.findUnique({
      where: { id: profile.id },
      select: {
        name: true,
        bio: true,
        photoUrl: true,
        slotDurationMinutes: true,
        specialization: { select: { name: true } },
        schedules: {
          where: { isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
          select: { id: true, dayOfWeek: true, startTime: true, endTime: true }
        }
      }
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      where: { doctorId: profile.id },
      _count: { _all: true }
    }),
    prisma.appointment.findMany({
      where: { doctorId: profile.id, startAt: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED'] } },
      orderBy: { startAt: 'asc' },
      take: 5,
      include: {
        service: { select: { name: true } },
        patient: { select: { name: true, phone: true } }
      }
    })
  ])

  const statusCounts = Object.fromEntries(counts.map((item) => [item.status, item._count._all]))
  return { doctor, statusCounts, upcoming }
})
