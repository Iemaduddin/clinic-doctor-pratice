import type { H3Event } from 'h3'
import { auth, type Role } from '~~/lib/auth'

export async function getAuthSession(event: H3Event) {
  return auth.api.getSession({ headers: event.headers })
}

export async function requireAuth(event: H3Event) {
  const session = await getAuthSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}

export async function requireRole(event: H3Event, roles: Role[]) {
  const session = await requireAuth(event)
  const role = session.user.role as Role
  if (!roles.includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return session
}

export function requireAdmin(event: H3Event) {
  return requireRole(event, ['SUPER_ADMIN', 'CLINIC_ADMIN'])
}
