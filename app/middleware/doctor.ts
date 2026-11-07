import { authClient } from '~~/lib/auth-client'

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useFetch)
  const user = session.value?.user as { role?: string } | undefined

  if (!user) return navigateTo('/login')
  if (user.role !== 'DOCTOR') return navigateTo(user.role === 'SUPER_ADMIN' || user.role === 'CLINIC_ADMIN' ? '/admin' : '/')
})
