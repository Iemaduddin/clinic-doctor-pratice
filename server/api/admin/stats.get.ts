import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [doctorsCount, activeDoctorsCount, servicesCount, schedulesCount, pendingAppointmentsCount, totalAppointmentsCount, recentAppointments] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.medicalService.count({ where: { isActive: true } }),
    prisma.doctorSchedule.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.appointment.count(),
    prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: { select: { name: true } },
        service: { select: { name: true } },
        patient: { select: { name: true, phone: true } }
      }
    })
  ])

  return {
    doctorsCount,
    activeDoctorsCount,
    servicesCount,
    schedulesCount,
    pendingAppointmentsCount,
    totalAppointmentsCount,
    recentAppointments
  }
})
