import type { H3Event } from 'h3'
import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'

export async function logAdminAction(event: H3Event, action: string, entity: string, entityId: string | null, _summary: string) {
  const session = await requireAdmin(event)
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      actorName: session.user.name,
      action,
      entity,
      entityId,
      summary: `${action} ${entity}`
    }
  })
}
