import type { H3Event } from 'h3'
import { prisma } from '~~/lib/prisma'
import { requireRole } from '~~/server/utils/rbac'

export async function requireDoctorProfile(event: H3Event) {
  const session = await requireRole(event, ['DOCTOR'])
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      specialization: { select: { name: true } }
    }
  })
  if (!doctor) throw createError({ statusCode: 404, statusMessage: 'Profil dokter belum terhubung' })
  return doctor
}
