<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiArrowLeftLine, RiHeartPulseLine } from 'oh-vue-icons/icons/ri'
import { authClient } from '~~/lib/auth-client'

addIcons(RiArrowLeftLine, RiHeartPulseLine)

const email = ref('')
const password = ref('')
const pending = ref(false)
const errorMessage = ref('')
const { data: session } = await authClient.useSession(useFetch)

function homeForRole(role?: string) {
  if (role === 'SUPER_ADMIN' || role === 'CLINIC_ADMIN') return '/admin'
  if (role === 'DOCTOR') return '/doctor'
  return '/'
}

if (session.value) {
  await navigateTo(homeForRole((session.value.user as { role?: string }).role))
}

async function submit() {
  pending.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await authClient.signIn.email({
      email: email.value,
      password: password.value
    })

    if (error) {
      errorMessage.value = error.message || 'Email atau kata sandi salah.'
      return
    }

    await navigateTo(homeForRole((data?.user as { role?: string } | undefined)?.role), { external: true })
  } catch {
    errorMessage.value = 'Tidak dapat menghubungi server. Coba lagi.'
  } finally {
    pending.value = false
  }
}

useHead({ title: 'Masuk Admin | Klinik Sehat' })
</script>

<template>
  <main class="grid min-h-screen bg-[#f8fafc] lg:grid-cols-2">
    <section class="hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 font-display text-xl font-bold"><span class="grid size-10 place-items-center rounded-xl bg-sage"><OhVueIcon name="ri-heart-pulse-line" class="size-5" /></span>Klinik Sehat</NuxtLink>
      <div class="max-w-md">
        <p class="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#6ee7b7]">Portal Internal</p>
        <h1 class="font-display text-4xl font-bold leading-tight">Kelola layanan klinik dengan tenang.</h1>
        <p class="mt-5 text-base leading-relaxed text-[#cbd5e1]">Atur dokter, layanan, dan jadwal praktik dari satu tempat. Perubahan langsung tampil di halaman pasien.</p>
      </div>
      <p class="text-sm text-[#94a3b8]">Akses khusus administrator klinik.</p>
    </section>

    <section class="flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <NuxtLink to="/" class="mb-10 flex items-center gap-3 font-display text-lg font-bold text-navy lg:hidden"><span class="grid size-9 place-items-center rounded-xl bg-sage text-white"><OhVueIcon name="ri-heart-pulse-line" class="size-5" /></span>Klinik Sehat</NuxtLink>
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-sage">Masuk portal</p>
        <h2 class="font-display text-3xl font-bold text-navy">Selamat datang kembali</h2>
        <p class="mt-2 text-base text-[#64748b]">Gunakan akun admin atau dokter untuk melanjutkan.</p>

        <form class="mt-8 space-y-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-navy" for="email">Email</label>
            <input id="email" v-model="email" type="email" autocomplete="email" required class="h-[46px] w-full rounded-lg border border-[#e2e8f0] bg-white px-4 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Masukkan email Anda">
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-navy" for="password">Kata sandi</label>
            <input id="password" v-model="password" type="password" autocomplete="current-password" required class="h-[46px] w-full rounded-lg border border-[#e2e8f0] bg-white px-4 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="••••••••">
          </div>
          <p v-if="errorMessage" class="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ errorMessage }}</p>
          <button type="submit" :disabled="pending" class="h-[46px] w-full rounded-lg bg-navy text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-50">{{ pending ? 'Memproses...' : 'Masuk ke dashboard' }}</button>
        </form>

        <NuxtLink to="/" class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#64748b] transition-colors hover:text-navy"><OhVueIcon name="ri-arrow-left-line" /> Kembali ke situs</NuxtLink>
      </div>
    </section>
  </main>
</template>
