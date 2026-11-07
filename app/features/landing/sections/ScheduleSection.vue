<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiArrowRightUpLine, RiTimeLine } from 'oh-vue-icons/icons/ri'

addIcons(RiArrowRightUpLine, RiTimeLine)

interface ScheduleDoctor {
  id: string
  name: string
  specialization: { id: string; name: string }
  schedules: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>
}

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const { data: doctors } = await useFetch<ScheduleDoctor[]>('/api/public/doctors')
const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const [year = 1970, month = 1, date = 1] = localDate.split('-').map(Number)
const today = new Date(Date.UTC(year, month - 1, date)).getUTCDay()
const localTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date())
const selectedDay = ref<number | ''>('')
const selectedSpecialization = ref('')
const specializations = computed(() => [...new Map((doctors.value ?? []).map(doctor => [doctor.specialization.id, doctor.specialization.name])).entries()])
const schedule = computed(() => (doctors.value ?? []).flatMap(doctor => doctor.schedules.map(item => ({ ...item, doctor, day: days[item.dayOfWeek] })))
  .filter(item => (selectedDay.value === '' || item.dayOfWeek === selectedDay.value) && (!selectedSpecialization.value || item.doctor.specialization.id === selectedSpecialization.value))
  .sort((a, b) => (a.dayOfWeek - today + 7) % 7 - (b.dayOfWeek - today + 7) % 7 || a.startTime.localeCompare(b.startTime)))
const nextSession = computed(() => schedule.value.find(item => item.dayOfWeek === today && item.endTime > localTime) ?? schedule.value.find(item => item.dayOfWeek !== today || item.endTime > localTime))
const groupedSchedule = computed(() => days.map((day, index) => ({ day, index, sessions: schedule.value.filter(item => item.dayOfWeek === index) })).filter(group => group.sessions.length))
</script>

<template>
  <section id="jadwal" class="scroll-mt-6 bg-white px-4 py-12 text-navy sm:px-6 sm:py-14 lg:px-8">
    <div class="mx-auto mb-6 max-w-[700px] text-center"><p class="mb-2 text-xs font-bold uppercase tracking-[.12em] text-sage">JADWAL PRAKTIK</p><h2 class="mb-2 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.2]">Pilih waktu kunjungan Anda.</h2><p class="text-sm leading-relaxed text-[#64748b] sm:text-base">Sesuaikan jadwal dengan dokter yang Anda tuju, lalu konfirmasi melalui WhatsApp.</p></div>
    <div class="mx-auto max-w-[1100px] space-y-3">
      <div class="space-y-3">
        <div class="flex flex-wrap items-end gap-3 rounded-xl border border-[#e2e8f0] bg-white p-3">
          <label class="grid gap-1 text-sm font-medium text-[#475569]">Hari<select v-model="selectedDay" aria-label="Filter jadwal berdasarkan hari" class="h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-navy"><option value="">Semua hari</option><option v-for="(day, index) in days" :key="day" :value="index">{{ day }}</option></select></label>
          <label class="grid gap-1 text-sm font-medium text-[#475569]">Spesialisasi<select v-model="selectedSpecialization" aria-label="Filter jadwal berdasarkan spesialisasi" class="h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-navy"><option value="">Semua spesialisasi</option><option v-for="item in specializations" :key="item[0]" :value="item[0]">{{ item[1] }}</option></select></label>
        </div>
        <article v-if="nextSession" class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-navy px-4 py-3 text-white"><div><p class="text-xs font-semibold uppercase tracking-wide text-[#b7d9c5]">Sesi praktik berikutnya</p><p class="mt-1 font-bold">{{ nextSession.doctor.name }}</p></div><p class="text-sm">{{ nextSession.day }}, {{ nextSession.startTime }}–{{ nextSession.endTime }} · {{ nextSession.doctor.specialization.name }}</p></article>
        <section v-for="group in groupedSchedule" :key="group.day" class="rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-[0_2px_6px_#0f172a0d]" :class="group.index === today ? 'border-sage bg-[#f0fdf4]' : ''"><h3 class="mb-2 font-display text-lg font-semibold">{{ group.day }}<span v-if="group.index === today" class="ml-2 rounded-full bg-sage px-2 py-1 text-xs text-white">Hari ini</span></h3><div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"><article v-for="item in group.sessions" :key="item.id" class="flex items-center justify-between gap-3 rounded-lg border border-[#e2e8f0] px-3 py-2"><div class="min-w-0"><h4 class="truncate text-sm font-semibold text-navy">{{ item.doctor.name }}</h4><p class="truncate text-xs text-sage-dark">{{ item.doctor.specialization.name }}</p></div><span class="shrink-0 rounded-md bg-[#f8fafc] px-2 py-1 text-xs font-medium text-[#475569]">{{ item.startTime }}–{{ item.endTime }}</span></article></div></section>
        <p v-if="!groupedSchedule.length" class="rounded-xl border border-[#e2e8f0] bg-white p-6 text-center text-[#64748b]">Tidak ada jadwal untuk filter ini.</p>
      </div>
      <aside class="flex flex-col gap-3 rounded-xl bg-[#f0fdf4] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="max-w-2xl">
          <h3 class="font-display text-lg font-semibold leading-[1.3]">Sudah menemukan jadwal yang cocok?</h3>
          <p class="mt-1 text-sm leading-relaxed text-[#475569]">Pilih dokter dan waktu konsultasi. Tim klinik akan membantu mengonfirmasi reservasi Anda.</p>
        </div>
        <NuxtLink class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#020617]" to="/booking">Buat janji konsultasi <OhVueIcon name="ri-arrow-right-up-line" aria-hidden="true" /></NuxtLink>
      </aside>
    </div>
  </section>
</template>
