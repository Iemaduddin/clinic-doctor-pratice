import { Prisma } from '@prisma/client'

export function throwPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Data sudah digunakan' })
    }
    if (error.code === 'P2003') {
      throw createError({ statusCode: 409, statusMessage: 'Data masih digunakan oleh data lain' })
    }
    if (error.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Data tidak ditemukan' })
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    if (error.message.includes('foreign key constraint') || error.message.includes('23001') || error.message.includes('23503')) {
      throw createError({ statusCode: 409, statusMessage: 'Data masih digunakan oleh data lain' })
    }
  }

  throw error
}
