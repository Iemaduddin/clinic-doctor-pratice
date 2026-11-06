<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiArrowRightUpLine, RiTimeLine } from 'oh-vue-icons/icons/ri'

addIcons(RiArrowRightUpLine, RiTimeLine)

const schedule = [
  { doctor: 'dr. Maya Prameswari, Sp.PD', day: 'Senin–Jumat', time: '08.00–12.00' },
  { doctor: 'dr. Adrian Nugroho, Sp.A', day: 'Senin–Jumat', time: '14.00–18.00' },
  { doctor: 'dr. Sinta Maharani', day: 'Sabtu', time: '08.00–12.00' }
]
</script>

<template>
  <section id="jadwal" class="scroll-mt-6 bg-white px-[10%] py-20 text-navy">
    <div class="mx-auto mb-9 max-w-[700px] text-center"><p class="mb-3 text-sm font-bold uppercase tracking-[.12em] text-sage">JADWAL PRAKTIK</p><h2 class="mb-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.2]">Pilih waktu kunjungan Anda.</h2><p class="text-base leading-relaxed text-[#64748b]">Sesuaikan jadwal dengan dokter yang Anda tuju, lalu konfirmasi melalui WhatsApp.</p></div>
    <div class="mx-auto grid max-w-[1100px] items-stretch gap-5 md:grid-cols-[2fr_1fr]">
      <div class="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white shadow-[0_2px_6px_#0f172a0d]">
        <table class="w-full border-collapse text-left">
          <thead><tr><th class="border-b border-[#e2e8f0] px-5 py-[18px] text-base font-semibold">Dokter</th><th class="border-b border-[#e2e8f0] px-5 py-[18px] text-base font-semibold">Hari</th><th class="border-b border-[#e2e8f0] px-5 py-[18px] text-base font-semibold">Jam praktik</th></tr></thead>
          <tbody><tr v-for="row in schedule" :key="row.doctor" class="transition-colors hover:bg-[#f8fafc]"><td class="border-b border-[#f1f5f9] px-5 py-[18px] text-base font-semibold text-navy">{{ row.doctor }}</td><td class="border-b border-[#f1f5f9] px-5 py-[18px] text-base text-[#475569]">{{ row.day }}</td><td class="border-b border-[#f1f5f9] px-5 py-[18px] text-base text-[#475569]">{{ row.time }}</td></tr></tbody>
        </table>
      </div>
      <aside class="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]">
        <span class="grid size-12 place-items-center rounded-xl bg-[#ecfdf5] text-2xl text-sage"><OhVueIcon name="ri-time-line" /></span>
        <h3 class="mb-2 mt-4 font-display text-[22px] font-semibold leading-[1.3]">Cara membuat janji</h3>
        <p class="mb-4 text-base leading-relaxed text-[#475569]">Pilih dokter dan waktu yang sesuai, lalu hubungi kami. Tim klinik akan memastikan ketersediaan slot Anda.</p>
        <a class="inline-flex items-center gap-3 rounded-lg bg-navy px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#020617]" href="https://wa.me/6281234567890?text=Halo%20Klinik%20Sehat%2C%20saya%20ingin%20membuat%20janji%20konsultasi." target="_blank" rel="noreferrer">Buat janji via WhatsApp <OhVueIcon name="ri-arrow-right-up-line" aria-hidden="true" /></a>
      </aside>
    </div>
  </section>
</template>
