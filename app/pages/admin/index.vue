<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckLine,
  RiHeartPulseLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiTimeLine
} from 'oh-vue-icons/icons/ri'

addIcons(
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckLine,
  RiHeartPulseLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiTimeLine
)

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface DashboardStats {
  doctorsCount: number
  activeDoctorsCount: number
  servicesCount: number
  schedulesCount: number
  pendingAppointmentsCount: number
  totalAppointmentsCount: number
  recentAppointments: Array<{
    id: string
    bookingCode: string
    startAt: string
    status: string
    doctor: { name: string }
    service: { name: string }
    patient: { name: string; phone: string }
  }>
}

const { data: stats, pending, error, refresh } = await useFetch<DashboardStats>('/api/admin/stats')

const cards = computed(() => [
  {
    to: '/admin/doctors',
    title: 'Dokter aktif',
    value: stats.value?.activeDoctorsCount ?? 0,
    detail: `${stats.value?.doctorsCount ?? 0} profil terdaftar`,
    icon: 'ri-stethoscope-line',
    tone: 'bg-[#ecfdf5] text-sage-dark'
  },
  {
    to: '/admin/services',
    title: 'Layanan medis',
    value: stats.value?.servicesCount ?? 0,
    detail: 'Layanan aktif untuk pasien',
    icon: 'ri-heart-pulse-line',
    tone: 'bg-[#eff6ff] text-[#1d4ed8]'
  },
  {
    to: '/admin/schedules',
    title: 'Jadwal praktik',
    value: stats.value?.schedulesCount ?? 0,
    detail: 'Sesi praktik aktif',
    icon: 'ri-time-line',
    tone: 'bg-[#fff7ed] text-[#c2410c]'
  }
])

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Jakarta'
  })
}

function formatTime(iso: string) {
  const date = new Date(iso)
  return `${String((date.getUTCHours() + 7) % 24).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
}

useHead({ title: 'Dashboard Admin | Klinik Sehat' })
</script>

<template>
  <div class="space-y-7">
    <section class="relative overflow-hidden rounded-2xl bg-navy px-6 py-7 text-white shadow-[0_12px_32px_#0f172a1a] sm:px-8 sm:py-9">
      <div class="absolute -right-10 -top-16 size-64 rounded-full border border-white/10"></div>
      <div class="absolute -right-1 -top-7 size-44 rounded-full border border-white/10"></div>
      <div class="relative flex flex-wrap items-end justify-between gap-5">
        <div>
          <p class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#6ee7b7]"><OhVueIcon name="ri-shield-check-line" /> Ringkasan operasional</p>
          <h1 class="font-display text-3xl font-bold sm:text-4xl">Dashboard Klinik</h1>
          <p class="mt-2 max-w-xl text-base leading-relaxed text-[#cbd5e1]">Pantau reservasi dan kelola operasional klinik dari satu tempat.</p>
        </div>
        <NuxtLink to="/admin/appointments" class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-[#ecfdf5]">
          Lihat reservasi <OhVueIcon name="ri-arrow-right-line" />
        </NuxtLink>
      </div>
    </section>

    <div v-if="error" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">
      <span>Ringkasan belum dapat dimuat.</span>
      <button type="button" class="font-semibold underline" @click="() => refresh()">Coba lagi</button>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistik klinik">
      <NuxtLink to="/admin/appointments" class="group rounded-2xl border border-[#e2e8f0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_#0f172a0f]">
        <div class="flex items-start justify-between">
          <span class="grid size-11 place-items-center rounded-xl bg-[#fef3c7] text-[#92400e]"><OhVueIcon name="ri-calendar-line" class="size-5" /></span>
          <span class="rounded-full bg-[#fef3c7] px-2.5 py-1 text-xs font-semibold text-[#92400e]">Perlu ditinjau</span>
        </div>
        <p class="mt-5 font-display text-3xl font-bold text-navy">{{ pending ? '—' : stats?.pendingAppointmentsCount ?? 0 }}</p>
        <p class="mt-1 text-sm font-semibold text-[#475569]">Reservasi pending</p>
      </NuxtLink>

      <NuxtLink v-for="card in cards" :key="card.to" :to="card.to" class="group rounded-2xl border border-[#e2e8f0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_#0f172a0f]">
        <div class="flex items-start justify-between">
          <span class="grid size-11 place-items-center rounded-xl" :class="card.tone"><OhVueIcon :name="card.icon" class="size-5" /></span>
          <OhVueIcon name="ri-arrow-right-line" class="text-[#94a3b8] transition-transform group-hover:translate-x-0.5" />
        </div>
        <p class="mt-5 font-display text-3xl font-bold text-navy">{{ pending ? '—' : card.value }}</p>
        <p class="mt-1 text-sm font-semibold text-[#475569]">{{ card.title }}</p>
        <p class="mt-1 text-xs text-[#94a3b8]">{{ card.detail }}</p>
      </NuxtLink>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
        <div class="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4 sm:px-6">
          <div>
            <h2 class="font-display text-lg font-bold text-navy">Reservasi terbaru</h2>
            <p class="mt-0.5 text-sm text-[#64748b]">Aktivitas reservasi terakhir.</p>
          </div>
          <NuxtLink to="/admin/appointments" class="text-sm font-semibold text-sage hover:text-sage-dark">Semua reservasi</NuxtLink>
        </div>

        <div v-if="pending" class="space-y-4 p-5">
          <div v-for="item in 4" :key="item" class="h-12 animate-pulse rounded-lg bg-[#f1f5f9]"></div>
        </div>
        <div v-else-if="!stats?.recentAppointments.length" class="px-5 py-10 text-center">
          <OhVueIcon name="ri-calendar-line" class="mx-auto size-9 text-[#cbd5e1]" />
          <p class="mt-2 text-sm font-semibold text-navy">Belum ada reservasi</p>
          <p class="mt-1 text-sm text-[#64748b]">Reservasi pasien akan tampil di sini.</p>
        </div>
        <div v-else class="divide-y divide-[#f1f5f9]">
          <NuxtLink v-for="item in stats.recentAppointments" :key="item.id" to="/admin/appointments" class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#f8fafc] sm:px-6">
            <div class="flex min-w-0 items-center gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-full bg-[#f1f5f9] text-[#475569]"><OhVueIcon name="ri-calendar-line" /></span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-navy">{{ item.patient.name }}</p>
                <p class="truncate text-xs text-[#64748b]">{{ item.doctor.name }} · {{ item.service.name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-right text-xs text-[#64748b]">{{ formatDate(item.startAt) }}<br>{{ formatTime(item.startAt) }}</span>
              <span class="rounded-full px-2 py-1 text-[11px] font-bold" :class="item.status === 'PENDING' ? 'bg-[#fef3c7] text-[#92400e]' : item.status === 'CONFIRMED' ? 'bg-[#ecfdf5] text-sage-dark' : item.status === 'COMPLETED' ? 'bg-[#eff6ff] text-[#1d4ed8]' : 'bg-[#f1f5f9] text-[#64748b]'">{{ item.status }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div class="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6">
        <h2 class="font-display text-lg font-bold text-navy">Kelola klinik</h2>
        <p class="mt-1 text-sm text-[#64748b]">Pintasan ke data operasional.</p>
        <div class="mt-5 space-y-2">
          <NuxtLink to="/admin/appointments" class="flex items-center gap-3 rounded-xl border border-[#e2e8f0] p-3.5 transition-colors hover:border-[#a7f3d0] hover:bg-[#f0fdf4]">
            <span class="grid size-10 place-items-center rounded-lg bg-[#fef3c7] text-[#92400e]"><OhVueIcon name="ri-calendar-line" /></span>
            <span class="flex-1"><span class="block text-sm font-semibold text-navy">Reservasi pasien</span><span class="block text-xs text-[#64748b]">Tinjau dan ubah status</span></span>
            <OhVueIcon name="ri-arrow-right-line" class="text-[#94a3b8]" />
          </NuxtLink>
          <NuxtLink to="/admin/doctors" class="flex items-center gap-3 rounded-xl border border-[#e2e8f0] p-3.5 transition-colors hover:border-[#a7f3d0] hover:bg-[#f0fdf4]">
            <span class="grid size-10 place-items-center rounded-lg bg-[#ecfdf5] text-sage-dark"><OhVueIcon name="ri-stethoscope-line" /></span>
            <span class="flex-1"><span class="block text-sm font-semibold text-navy">Dokter & spesialisasi</span><span class="block text-xs text-[#64748b]">Kelola profil dokter</span></span>
            <OhVueIcon name="ri-arrow-right-line" class="text-[#94a3b8]" />
          </NuxtLink>
          <NuxtLink to="/admin/services" class="flex items-center gap-3 rounded-xl border border-[#e2e8f0] p-3.5 transition-colors hover:border-[#a7f3d0] hover:bg-[#f0fdf4]">
            <span class="grid size-10 place-items-center rounded-lg bg-[#eff6ff] text-[#1d4ed8]"><OhVueIcon name="ri-heart-pulse-line" /></span>
            <span class="flex-1"><span class="block text-sm font-semibold text-navy">Layanan medis</span><span class="block text-xs text-[#64748b]">Atur layanan dan durasi</span></span>
            <OhVueIcon name="ri-arrow-right-line" class="text-[#94a3b8]" />
          </NuxtLink>
          <NuxtLink to="/admin/schedules" class="flex items-center gap-3 rounded-xl border border-[#e2e8f0] p-3.5 transition-colors hover:border-[#a7f3d0] hover:bg-[#f0fdf4]">
            <span class="grid size-10 place-items-center rounded-lg bg-[#fff7ed] text-[#c2410c]"><OhVueIcon name="ri-time-line" /></span>
            <span class="flex-1"><span class="block text-sm font-semibold text-navy">Jadwal praktik</span><span class="block text-xs text-[#64748b]">Atur sesi dokter</span></span>
            <OhVueIcon name="ri-arrow-right-line" class="text-[#94a3b8]" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-[#d1fae5] bg-[#ecfdf5] p-5 sm:p-6">
      <div class="flex items-start gap-3">
        <span class="grid size-9 shrink-0 place-items-center rounded-full bg-white text-sage-dark"><OhVueIcon name="ri-check-line" /></span>
        <div>
          <h2 class="text-sm font-bold text-navy">Alur operasional</h2>
          <p class="mt-1 text-sm leading-relaxed text-[#475569]">Pastikan dokter dan jadwal praktik aktif agar pasien bisa memilih slot. Tinjau reservasi pending untuk mengonfirmasi kunjungan.</p>
        </div>
      </div>
    </section>
  </div>
</template>
