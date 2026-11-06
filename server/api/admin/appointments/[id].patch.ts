import { z } from 'zod'
import { prisma } from '~~/lib/prisma'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib diisi' })

  const body = await parseBody(event, updateStatusSchema)

  const appointment = await prisma.appointment.findUnique({ where: { id } })
  if (!appointment) throw createError({ statusCode: 404, statusMessage: 'Reservasi tidak ditemukan' })

  // Validate allowed status transitions according to PRD rule
  // Pending -> Confirmed or Cancelled
  // Confirmed -> Completed or Cancelled
  const current = appointment.status
  const next = body.status

  if (current === 'CANCELLED' || current === 'COMPLETED') {
    throw createError({ statusCode: 400, statusMessage: `Status ${current} tidak dapat diubah lagi` })
  }

  if (current === 'PENDING' && !['CONFIRMED', 'CANCELLED'].includes(next)) {
    throw createError({ statusCode: 400, statusMessage: 'Reservasi Pending hanya dapat diubah ke Confirmed atau Cancelled' })
  }

  if (current === 'CONFIRMED' && !['COMPLETED', 'CANCELLED'].includes(next)) {
    throw createError({ statusCode: 400, statusMessage: 'Reservasi Confirmed hanya dapat diubah ke Completed atau Cancelled' })
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: next,
        // Clear activeSlotKey if cancelled so slot becomes free again
        ...(next === 'CANCELLED' ? { activeSlotKey: null } : {})
      },
      include: {
        doctor: { select: { name: true } },
        service: { select: { name: true } },
        patient: { select: { name: true, phone: true } }
      }
    })

    return updated
  } catch (error) {
    throwPrismaError(error)
  }
})
