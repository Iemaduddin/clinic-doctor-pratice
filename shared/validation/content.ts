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

export const clinicProfileSchema = z.object({
  name: z.string().trim().min(2, 'Minimal 2 karakter').max(120),
  tagline: nullableText(160),
  about: nullableText(4000),
  address: z.string().trim().min(5, 'Minimal 5 karakter').max(300),
  phone: z.string().trim().min(5, 'Minimal 5 karakter').max(30),
  whatsapp: z.string().trim().min(5, 'Minimal 5 karakter').max(30),
  email: z.email('Format email tidak valid').max(120),
  mapsUrl: nullableUrl,
  timezone: z.string().trim().min(1, 'Zona waktu wajib diisi').max(64)
})

export const facilitySchema = z.object({
  name: z.string().trim().min(2, 'Minimal 2 karakter').max(120),
  description: nullableText(1000),
  imageUrl: nullableUrl,
  sortOrder: z.coerce.number().int().min(0).max(9999)
})

export const testimonialSchema = z.object({
  patientName: z.string().trim().min(2, 'Minimal 2 karakter').max(120),
  content: z.string().trim().min(5, 'Minimal 5 karakter').max(2000),
  rating: z.coerce.number().int().min(1, 'Rating 1 sampai 5').max(5, 'Rating 1 sampai 5'),
  isPublished: z.boolean()
})

export const faqSchema = z.object({
  question: z.string().trim().min(5, 'Minimal 5 karakter').max(300),
  answer: z.string().trim().min(5, 'Minimal 5 karakter').max(4000),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isPublished: z.boolean()
})
