<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiArrowRightUpLine, RiStethoscopeLine } from 'oh-vue-icons/icons/ri'

addIcons(RiArrowRightUpLine, RiStethoscopeLine)

interface PublicDoctor {
  id: string
  name: string
  photoUrl: string | null
  specialization: { name: string }
  schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
}

const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const { data: doctors } = await useFetch<PublicDoctor[]>('/api/public/doctors')

function formatDoctorSchedule(schedules: PublicDoctor['schedules']) {
  if (!schedules?.length) return 'Jadwal berdasarkan janji'
  return schedules.map((schedule) => `${daysMap[schedule.dayOfWeek]} (${schedule.startTime}–${schedule.endTime})`).join(', ')
}
</script>

<template>
  <section id="dokter" class="scroll-mt-6 bg-[#f8fafc] px-[10%] py-20 text-navy">
    <div class="mx-auto mb-9 max-w-[700px] text-center">
      <p class="mb-3 text-sm font-bold uppercase tracking-[.12em] text-sage">TENAGA MEDIS</p>
      <h2 class="mb-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.2]">Tim yang mendampingi Anda.</h2>
      <p class="text-base leading-relaxed text-[#64748b]">Dokter kami menggabungkan pengalaman klinis dengan komunikasi yang terbuka agar setiap kunjungan terasa jelas dan nyaman.</p>
    </div>

    <div v-if="doctors?.length" class="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-3">
      <article v-for="(doctor, index) in doctors" :key="doctor.id" class="relative flex flex-col rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]">
        <img v-if="doctor.photoUrl" class="block h-[240px] w-full rounded-lg object-cover" :src="doctor.photoUrl" :alt="doctor.name" loading="lazy" decoding="async">
        <div v-else class="grid h-[240px] w-full place-items-center rounded-lg bg-[#f1f5f9] text-navy"><OhVueIcon name="ri-stethoscope-line" class="size-12" /></div>
        <span class="mt-4 inline-block w-fit rounded-full bg-[#ecfdf5] px-2.5 py-1.5 text-xs font-semibold text-sage-dark">Dokter Aktif</span>
        <h3 class="mb-1 mt-3 font-display text-xl font-bold text-navy">{{ doctor.name }}</h3>
        <p class="mb-2 text-sm font-semibold text-[#475569]">{{ doctor.specialization.name }}</p>
        <p class="text-xs leading-relaxed text-[#64748b]">{{ formatDoctorSchedule(doctor.schedules) }}</p>
        <div class="mt-auto pt-4">
          <NuxtLink :to="`/booking?doctor=${doctor.id}`" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#020617]">
            Buat Janji Konsultasi <OhVueIcon name="ri-arrow-right-up-line" />
          </NuxtLink>
        </div>
        <span class="absolute right-6 top-6 text-sm font-bold text-[#94a3b8]">{{ String(index + 1).padStart(2, '0') }}</span>
      </article>
    </div>
    <p v-else class="mx-auto max-w-[700px] rounded-xl border border-[#e2e8f0] bg-white p-6 text-center text-base text-[#64748b]">Profil dokter akan segera tersedia.</p>
  </section>
</template>
