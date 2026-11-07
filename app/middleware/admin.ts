import { authClient } from '~~/lib/auth-client'

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.useSession(useFetch)
  const user = session.value?.user as { role?: string } | undefined

  if (!user) {
    return navigateTo('/login')
  }

  const route = useRoute()
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'CLINIC_ADMIN') {
    return navigateTo(user.role === 'DOCTOR' ? '/doctor' : '/')
  }
  if (route.path.startsWith('/admin/users') && user.role !== 'SUPER_ADMIN') {
    return navigateTo('/admin')
  }
})
