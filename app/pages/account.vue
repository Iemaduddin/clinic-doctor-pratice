<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiArrowLeftLine, RiHeartPulseLine, RiLockPasswordLine, RiUserLine } from 'oh-vue-icons/icons/ri'
import { authClient } from '~~/lib/auth-client'

addIcons(RiArrowLeftLine, RiHeartPulseLine, RiLockPasswordLine, RiUserLine)

definePageMeta({ middleware: 'account' })

interface SessionUser {
  id: string
  name: string
  email: string
  phone?: string | null
  role?: string
}

const { data: session } = await authClient.useSession(useFetch)
const user = computed(() => session.value?.user as SessionUser | undefined)

const profile = reactive({ name: '', phone: '' })
const profileSaving = ref(false)
const profileError = ref('')
const profileNotice = ref('')

const password = reactive({ current: '', next: '', confirm: '' })
const passwordSaving = ref(false)
const passwordError = ref('')
const passwordNotice = ref('')

watchEffect(() => {
  if (user.value) {
    profile.name = user.value.name || ''
    profile.phone = user.value.phone || ''
  }
})

const homeTo = computed(() => {
  if (user.value?.role === 'SUPER_ADMIN' || user.value?.role === 'CLINIC_ADMIN') return '/admin'
  if (user.value?.role === 'DOCTOR') return '/doctor'
  return '/'
})

async function saveProfile() {
  profileSaving.value = true
  profileError.value = ''
  profileNotice.value = ''
  try {
    await $fetch('/api/account/profile', { method: 'PATCH', body: profile })
    profileNotice.value = 'Profil diperbarui.'
  } catch (error) {
    profileError.value = apiErrorMessage(error, 'Gagal memperbarui profil.')
  } finally {
    profileSaving.value = false
  }
}

async function changePassword() {
  passwordError.value = ''
  passwordNotice.value = ''
  if (password.next.length < 8) {
    passwordError.value = 'Kata sandi baru minimal 8 karakter.'
    return
  }
  if (password.next !== password.confirm) {
    passwordError.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }

  passwordSaving.value = true
  try {
    const { error } = await authClient.changePassword({
      currentPassword: password.current,
      newPassword: password.next,
      revokeOtherSessions: true
    })
    if (error) {
      passwordError.value = error.message || 'Gagal mengubah kata sandi.'
      return
    }
    password.current = ''
    password.next = ''
    password.confirm = ''
    passwordNotice.value = 'Kata sandi diperbarui. Sesi lain telah dikeluarkan.'
  } catch (error) {
    passwordError.value = apiErrorMessage(error, 'Gagal mengubah kata sandi.')
  } finally {
    passwordSaving.value = false
  }
}

useHead({ title: 'Akun Saya | Klinik Sehat' })
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] px-4 py-8 text-navy sm:px-6 lg:py-12">
    <div class="mx-auto max-w-3xl">
      <NuxtLink :to="homeTo" class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#64748b] hover:text-navy"><OhVueIcon name="ri-arrow-left-line" /> Kembali</NuxtLink>

      <div class="mb-6 flex items-center gap-3">
        <span class="grid size-11 place-items-center rounded-xl bg-sage text-white"><OhVueIcon name="ri-user-line" class="size-5" /></span>
        <div>
          <h1 class="font-display text-3xl font-bold">Akun Saya</h1>
          <p class="text-sm text-[#64748b]">{{ user?.email }}</p>
        </div>
      </div>

      <div class="space-y-6">
        <section class="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6">
          <h2 class="mb-4 font-display text-xl font-bold">Profil</h2>
          <p v-if="profileError" class="mb-4 rounded-xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ profileError }}</p>
          <p v-if="profileNotice" class="mb-4 rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ profileNotice }}</p>
          <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveProfile">
            <label class="block"><span class="mb-1.5 block text-sm font-semibold">Nama lengkap</span><input v-model="profile.name" required minlength="2" maxlength="100" class="w-full rounded-xl border border-[#cbd5e1] px-4 py-2.5 outline-none focus:border-sage" /></label>
            <label class="block"><span class="mb-1.5 block text-sm font-semibold">Nomor telepon</span><input v-model="profile.phone" maxlength="20" placeholder="08xxxxxxxxxx" class="w-full rounded-xl border border-[#cbd5e1] px-4 py-2.5 outline-none focus:border-sage" /></label>
            <div class="sm:col-span-2"><button type="submit" :disabled="profileSaving" class="rounded-xl bg-sage px-5 py-2.5 font-semibold text-white transition-colors hover:bg-sage-dark disabled:opacity-50">{{ profileSaving ? 'Menyimpan...' : 'Simpan profil' }}</button></div>
          </form>
        </section>

        <section class="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6">
          <h2 class="mb-4 flex items-center gap-2 font-display text-xl font-bold"><OhVueIcon name="ri-lock-password-line" /> Ubah kata sandi</h2>
          <p v-if="passwordError" class="mb-4 rounded-xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ passwordError }}</p>
          <p v-if="passwordNotice" class="mb-4 rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ passwordNotice }}</p>
          <form class="grid gap-4" @submit.prevent="changePassword">
            <label class="block"><span class="mb-1.5 block text-sm font-semibold">Kata sandi saat ini</span><input v-model="password.current" type="password" required autocomplete="current-password" class="w-full rounded-xl border border-[#cbd5e1] px-4 py-2.5 outline-none focus:border-sage" /></label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block"><span class="mb-1.5 block text-sm font-semibold">Kata sandi baru</span><input v-model="password.next" type="password" required minlength="8" autocomplete="new-password" class="w-full rounded-xl border border-[#cbd5e1] px-4 py-2.5 outline-none focus:border-sage" /></label>
              <label class="block"><span class="mb-1.5 block text-sm font-semibold">Konfirmasi kata sandi baru</span><input v-model="password.confirm" type="password" required minlength="8" autocomplete="new-password" class="w-full rounded-xl border border-[#cbd5e1] px-4 py-2.5 outline-none focus:border-sage" /></label>
            </div>
            <div><button type="submit" :disabled="passwordSaving" class="rounded-xl bg-navy px-5 py-2.5 font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-50">{{ passwordSaving ? 'Menyimpan...' : 'Ubah kata sandi' }}</button></div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>
