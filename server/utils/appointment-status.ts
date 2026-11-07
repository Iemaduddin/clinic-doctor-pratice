import { z } from 'zod'

export const appointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
})

export function assertStatusTransition(current: string, next: string) {
  if (current === 'CANCELLED' || current === 'COMPLETED') {
    throw createError({ statusCode: 400, statusMessage: `Status ${current} tidak dapat diubah lagi` })
  }
  if (current === 'PENDING' && !['CONFIRMED', 'CANCELLED'].includes(next)) {
    throw createError({ statusCode: 400, statusMessage: 'Reservasi Pending hanya dapat diubah ke Confirmed atau Cancelled' })
  }
  if (current === 'CONFIRMED' && !['COMPLETED', 'CANCELLED'].includes(next)) {
    throw createError({ statusCode: 400, statusMessage: 'Reservasi Confirmed hanya dapat diubah ke Completed atau Cancelled' })
  }
}
