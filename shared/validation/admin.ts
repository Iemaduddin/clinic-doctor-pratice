import { z } from 'zod'

const nullableText = (max: number) =>
  z
    .string()
    .max(max)
    .nullish()
    .transform((value) => value?.trim() || null)

const nullableUrl = z
  .union([z.literal(''), z.string().trim().url('URL tidak valid').max(500)])
  .nullish()
  .transform((value) => value || null)

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Gunakan format HH:mm')

export const specializationSchema = z.object({
  name: z.string().trim().min(2, 'Minimal 2 karakter').max(100),
  description: nullableText(500)
})

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Minimal 2 karakter').max(120),
  specializationId: z.string().trim().min(1, 'Spesialisasi wajib dipilih'),
  bio: nullableText(2000),
  photoUrl: nullableUrl,
  slotDurationMinutes: z.coerce.number().int().min(5).max(240),
  isActive: z.boolean()
})

export const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Minimal 2 karakter').max(120),
  description: nullableText(1000),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  isActive: z.boolean()
})

export const scheduleSchema = z
  .object({
    doctorId: z.string().trim().min(1, 'Dokter wajib dipilih'),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: time,
    endTime: time,
    isActive: z.boolean()
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Jam selesai harus setelah jam mulai',
    path: ['endTime']
  })
