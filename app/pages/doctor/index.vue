<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiTimeLine } from 'oh-vue-icons/icons/ri'

addIcons(RiTimeLine)

definePageMeta({ layout: 'doctor', middleware: 'doctor' })

interface Overview {
  doctor: {
    name: string
    bio: string | null
    photoUrl: string | null
    slotDurationMinutes: number
    specialization: { name: string }
    schedules: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>
  }
  statusCounts: Record<string, number>
  upcoming: Array<{
    id: string
    bookingCode: string
    startAt: string
    status: string
    service: { name: string }
    patient: { name: string; phone: string }
  }>
}

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const { data, pending } = await useFetch<Overview>('/api/doctor/overview')
const total = computed(() => Object.values(data.value?.statusCounts ?? {}).reduce((sum, count) => sum + count, 0))

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

useHead({ title: 'Portal Dokter | Klinik Sehat' })
</script>

<template>
  <div>
    <div class="mb-6">
      <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Portal Dokter</p>
      <h1 class="font-display text-3xl font-bold text-navy">Halo, {{ data?.doctor.name || 'Dokter' }}</h1>
      <p class="mt-2 text-base text-[#64748b]">{{ data?.doctor.specialization.name || 'Memuat profil...' }}</p>
    </div>

    <div v-if="pending" class="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center text-[#64748b]">Memuat data...</div>
    <template v-else-if="data">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-[#e2e8f0] bg-white p-5"><p class="text-sm text-[#64748b]">Total reservasi</p><p class="mt-2 font-display text-3xl font-bold text-navy">{{ total }}</p></div>
        <div class="rounded-2xl border border-[#e2e8f0] bg-white p-5"><p class="text-sm text-[#64748b]">Menunggu</p><p class="mt-2 font-display text-3xl font-bold text-[#b45309]">{{ data.statusCounts.PENDING || 0 }}</p></div>
        <div class="rounded-2xl border border-[#e2e8f0] bg-white p-5"><p class="text-sm text-[#64748b]">Terkonfirmasi</p><p class="mt-2 font-display text-3xl font-bold text-sage-dark">{{ data.statusCounts.CONFIRMED || 0 }}</p></div>
        <div class="rounded-2xl border border-[#e2e8f0] bg-white p-5"><p class="text-sm text-[#64748b]">Selesai</p><p class="mt-2 font-display text-3xl font-bold text-navy">{{ data.statusCounts.COMPLETED || 0 }}</p></div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <section class="rounded-2xl border border-[#e2e8f0] bg-white p-5 lg:col-span-2">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="font-display text-xl font-bold text-navy">Reservasi mendatang</h2>
            <NuxtLink to="/doctor/appointments" class="text-sm font-semibold text-sage hover:text-sage-dark">Lihat semua</NuxtLink>
          </div>
          <p v-if="!data.upcoming.length" class="py-8 text-center text-sm text-[#64748b]">Belum ada reservasi mendatang.</p>
          <div v-else class="divide-y divide-[#e2e8f0]">
            <div v-for="item in data.upcoming" :key="item.id" class="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p class="font-semibold text-navy">{{ item.patient.name }}</p>
                <p class="text-sm text-[#64748b]">{{ item.service.name }} · {{ item.bookingCode }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-navy">{{ formatDateTime(item.startAt) }}</p>
                <span class="text-xs font-semibold" :class="item.status === 'CONFIRMED' ? 'text-sage-dark' : 'text-[#b45309]'">{{ item.status }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-[#e2e8f0] bg-white p-5">
          <h2 class="mb-4 flex items-center gap-2 font-display text-xl font-bold text-navy"><OhVueIcon name="ri-time-line" /> Jadwal praktik</h2>
          <p v-if="!data.doctor.schedules.length" class="py-6 text-center text-sm text-[#64748b]">Belum ada jadwal aktif.</p>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="schedule in data.doctor.schedules" :key="schedule.id" class="flex justify-between gap-3 rounded-lg bg-[#f8fafc] px-3 py-2">
              <span class="font-medium text-navy">{{ days[schedule.dayOfWeek] }}</span>
              <span class="text-[#475569]">{{ schedule.startTime }}–{{ schedule.endTime }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>
