import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

export const ROLES = ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'PATIENT'] as const

export type Role = (typeof ROLES)[number]

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: [...ROLES],
        required: false,
        defaultValue: 'PATIENT',
        input: false,
        returned: true
      }
    }
  }
})
