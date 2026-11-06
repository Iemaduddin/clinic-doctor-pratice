import { z } from 'zod'
import { auth } from '~~/lib/auth'
import { prisma } from '~~/lib/prisma'
import { requireRole } from '~~/server/utils/rbac'

const inputSchema = z.object({ name: z.string().trim().min(1).max(100), email: z.email(), phone: z.string().trim().max(30).nullable().optional(), password: z.string().min(8).max(100), role: z.enum(['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'PATIENT']) })
const safeSelect = { id: true, name: true, email: true, phone: true, role: true, createdAt: true } as const

export default defineEventHandler(async (event) => {
  await requireRole(event, ['SUPER_ADMIN'])
  const body = await readBody(event)
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Data tidak valid' })
  const { name, email, phone, password, role } = parsed.data
  try {
    const result = await auth.api.signUpEmail({ body: { name, email, password } })
    const user = await prisma.user.update({ where: { id: result.user.id }, data: { role, phone: phone || null }, select: safeSelect })
    setResponseStatus(event, 201)
    return user
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({ statusCode: 409, statusMessage: 'Email sudah digunakan' })
  }
})
