import { z } from 'zod'
import { prisma } from '~~/lib/prisma'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { parseBody } from '~~/server/utils/validation'

const cancelSchema = z.object({
  phone: z.string().trim().min(1, 'Nomor HP wajib diisi')
})

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Kode reservasi wajib diisi' })

  const body = await parseBody(event, cancelSchema)

  const appointment = await prisma.appointment.findUnique({
    where: { bookingCode: code },
    include: { patient: true }
  })

  if (!appointment) {
    throw createError({ statusCode: 404, statusMessage: 'Reservasi tidak ditemukan' })
  }

  // Normalize phone for comparison
  const normInput = body.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')
  const normDB = appointment.patient.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')

  if (normInput !== normDB) {
    throw createError({ statusCode: 403, statusMessage: 'Nomor telepon tidak sesuai dengan data reservasi' })
  }

  if (appointment.status === 'CANCELLED') {
    throw createError({ statusCode: 400, statusMessage: 'Reservasi sudah dibatalkan sebelumnya' })
  }

  if (appointment.status === 'COMPLETED') {
    throw createError({ statusCode: 400, statusMessage: 'Reservasi yang sudah selesai tidak dapat dibatalkan' })
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        activeSlotKey: null // Clear active slot key so slot becomes available again
      }
    })
    return { success: true, bookingCode: updated.bookingCode, status: updated.status }
  } catch (error) {
    throwPrismaError(error)
  }
})
