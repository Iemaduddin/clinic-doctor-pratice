import { z } from 'zod'
import { prisma } from '~~/lib/prisma'
import { requireRole } from '~~/server/utils/rbac'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).default(''),
  role: z.preprocess((value) => value === '' ? undefined : value, z.enum(['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'PATIENT']).optional()),
  sortBy: z.enum(['name', 'email', 'phone', 'role', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['SUPER_ADMIN'])
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Parameter tidak valid' })
  const { page, pageSize, search, role, sortBy, sortOrder } = parsed.data
  const where = {
    ...(role ? { role } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {})
  }
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.user.count({ where })
  ])
  return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
})
