import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      photoUrl: true,
      slotDurationMinutes: true,
      specialization: { select: { id: true, name: true } },
      schedules: {
        where: { isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        select: { id: true, dayOfWeek: true, startTime: true, endTime: true }
      }
    }
  })
})
