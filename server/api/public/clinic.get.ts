import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async () => {
  return prisma.clinicProfile.findUnique({
    where: { id: 'default' },
    select: { name: true, address: true, phone: true, whatsapp: true, email: true, mapsUrl: true }
  })
})
