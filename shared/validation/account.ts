import { z } from 'zod'

export const accountProfileSchema = z.object({
  name: z.string().trim().min(2, 'Minimal 2 karakter').max(100),
  phone: z
    .union([z.literal(''), z.string().trim().regex(/^[0-9+\-\s()]{6,20}$/, 'Nomor telepon tidak valid')])
    .optional()
    .transform((value) => value || null)
})
