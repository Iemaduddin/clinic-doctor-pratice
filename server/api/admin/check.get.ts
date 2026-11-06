import { requireRole } from '../../utils/rbac'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['SUPER_ADMIN', 'CLINIC_ADMIN'])
  return { authorized: true }
})
