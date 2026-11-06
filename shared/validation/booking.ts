import { z } from 'zod'

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const publicBookingSchema = z.object({
  doctorId: z.string().trim().min(1, 'Dokter wajib dipilih'),
  serviceId: z.string().trim().min(1, 'Layanan wajib dipilih'),
  date: z.string().regex(dateRegex, 'Format tanggal harus YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Format jam harus HH:mm'),
  patientName: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  patientPhone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Nomor WhatsApp tidak valid (contoh: 081234567890)'),
  patientEmail: z
    .union([z.literal(''), z.string().trim().email('Format email tidak valid').max(100)])
    .nullish()
    .transform((val) => val || null),
  note: z
    .string()
    .max(500)
    .nullish()
    .transform((val) => val?.trim() || null)
})

export type PublicBookingPayload = z.infer<typeof publicBookingSchema>
