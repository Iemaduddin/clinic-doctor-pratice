import { requireAuth } from '../utils/rbac'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  return { user: session.user }
})
