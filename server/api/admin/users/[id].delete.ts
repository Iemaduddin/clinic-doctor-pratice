import { logAdminAction } from '~~/server/utils/audit-log'
import { prisma } from '~~/lib/prisma'
import { requireRole } from '~~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })
  if (id === session.user.id) throw createError({ statusCode: 400, statusMessage: 'Tidak dapat menghapus akun sendiri' })
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id }, select: { id: true, role: true } })
    if (!user) throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan' })
    if (user.role === 'SUPER_ADMIN') {
      const admins = await tx.user.count({ where: { role: 'SUPER_ADMIN' } })
      if (admins <= 1) throw createError({ statusCode: 400, statusMessage: 'Super Admin terakhir tidak dapat dihapus' })
    }
    await tx.user.delete({ where: { id } })
  })
  await logAdminAction(event, 'DELETE', 'USER', id, '')
  return { success: true }
})
