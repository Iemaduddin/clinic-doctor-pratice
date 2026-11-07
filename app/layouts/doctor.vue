<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiCalendarCheckLine, RiDashboardLine, RiHeartPulseLine, RiLogoutBoxRLine, RiUserLine } from 'oh-vue-icons/icons/ri'
import { authClient } from '~~/lib/auth-client'

addIcons(RiCalendarCheckLine, RiDashboardLine, RiHeartPulseLine, RiLogoutBoxRLine, RiUserLine)

const links = [
  { to: '/doctor', label: 'Ringkasan', icon: 'ri-dashboard-line', exact: true },
  { to: '/doctor/appointments', label: 'Reservasi', icon: 'ri-calendar-check-line', exact: false }
]

const { data: session } = await authClient.useSession(useFetch)
const user = computed(() => session.value?.user as { name?: string; email?: string } | undefined)

async function logout() {
  await authClient.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-[#f8fafc] text-navy">
    <aside class="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#e2e8f0] bg-white p-5 lg:flex">
      <NuxtLink to="/doctor" class="mb-8 flex items-center gap-3 font-display text-lg font-bold">
        <span class="grid size-10 place-items-center rounded-xl bg-sage text-white"><OhVueIcon name="ri-heart-pulse-line" class="size-5" /></span>
        Portal Dokter
      </NuxtLink>
      <nav class="space-y-1">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" :exact="link.exact" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-[#475569] transition-colors hover:bg-[#f8fafc] hover:text-navy" active-class="bg-[#ecfdf5] text-sage-dark hover:bg-[#ecfdf5] hover:text-sage-dark">
          <OhVueIcon :name="link.icon" class="size-5" />{{ link.label }}
        </NuxtLink>
      </nav>
      <div class="mt-auto space-y-3 border-t border-[#e2e8f0] pt-4">
        <div class="rounded-lg bg-[#f8fafc] p-3">
          <p class="truncate text-sm font-semibold text-navy">{{ user?.name || 'Dokter' }}</p>
          <p class="truncate text-xs text-[#64748b]">{{ user?.email }}</p>
        </div>
        <NuxtLink to="/account" class="flex items-center gap-2 px-3 text-sm font-medium text-[#64748b] transition-colors hover:text-navy"><OhVueIcon name="ri-user-line" /> Akun saya</NuxtLink>
        <NuxtLink to="/" class="flex items-center gap-2 px-3 text-sm font-medium text-[#64748b] transition-colors hover:text-navy"><OhVueIcon name="ri-heart-pulse-line" /> Lihat situs</NuxtLink>
        <button type="button" class="flex w-full items-center gap-2 px-3 text-sm font-medium text-[#64748b] transition-colors hover:text-[#b91c1c]" @click="logout"><OhVueIcon name="ri-logout-box-r-line" /> Keluar</button>
      </div>
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/95 lg:hidden">
        <div class="flex items-center justify-between px-4 py-3">
          <NuxtLink to="/doctor" class="flex items-center gap-2 font-display text-base font-bold"><span class="grid size-8 place-items-center rounded-lg bg-sage text-white"><OhVueIcon name="ri-heart-pulse-line" class="size-4" /></span>Portal Dokter</NuxtLink>
          <button type="button" class="text-sm font-semibold text-[#64748b]" @click="logout">Keluar</button>
        </div>
        <nav class="flex gap-1 overflow-x-auto px-3 pb-2">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" :exact="link.exact" class="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-[#475569]" active-class="bg-[#ecfdf5] text-sage-dark">{{ link.label }}</NuxtLink>
        </nav>
      </header>
      <main class="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"><slot /></main>
    </div>
  </div>
</template>
