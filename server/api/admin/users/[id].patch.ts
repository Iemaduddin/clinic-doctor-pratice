import { hashPassword } from 'better-auth/crypto'
import { z } from 'zod'
import { prisma } from '~~/lib/prisma'
import { requireRole } from '~~/server/utils/rbac'

const schema = z.object({ name: z.string().trim().min(1).max(100).optional(), phone: z.string().trim().max(30).nullable().optional(), password: z.string().min(8).max(100).optional(), role: z.enum(['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'PATIENT']).optional() }).refine((data) => data.name !== undefined || data.phone !== undefined || data.password !== undefined || data.role !== undefined)

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Data tidak valid' })
  const current = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan' })
  if (id === session.user.id && parsed.data.role && parsed.data.role !== 'SUPER_ADMIN') {
    throw createError({ statusCode: 400, statusMessage: 'Tidak dapat menurunkan peran sendiri' })
  }
  if (current.role === 'SUPER_ADMIN' && parsed.data.role && parsed.data.role !== 'SUPER_ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
    if (admins <= 1) throw createError({ statusCode: 400, statusMessage: 'Super Admin terakhir tidak dapat diturunkan' })
  }
  const { password, ...userData } = parsed.data
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id }, data: userData, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } })
    if (password) {
      const account = await tx.account.findFirst({ where: { userId: id, providerId: 'credential' }, select: { id: true } })
      if (!account) throw createError({ statusCode: 400, statusMessage: 'Akun tidak memiliki login password' })
      await tx.account.update({ where: { id: account.id }, data: { password: await hashPassword(password) } })
      await tx.session.deleteMany({ where: { userId: id } })
    }
    return user
  })
})
