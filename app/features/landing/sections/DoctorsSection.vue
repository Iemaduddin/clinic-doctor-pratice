<script setup lang="ts">
const doctors = [
  {
    name: 'dr. Maya Prameswari, Sp.PD',
    specialty: 'Spesialis Penyakit Dalam',
    schedule: 'Senin–Jumat, 08.00–12.00',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=720&q=80',
    alt: 'dr. Maya Prameswari, Sp.PD'
  },
  {
    name: 'dr. Adrian Nugroho, Sp.A',
    specialty: 'Spesialis Anak',
    schedule: 'Senin–Jumat, 14.00–18.00',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=720&q=80',
    alt: 'dr. Adrian Nugroho, Sp.A'
  },
  {
    name: 'dr. Sinta Maharani',
    specialty: 'Dokter Umum',
    schedule: 'Sabtu, 08.00–12.00',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=720&q=80',
    alt: 'dr. Sinta Maharani'
  }
]
</script>

<template>
  <section id="dokter" class="scroll-mt-6 bg-[#f8fafc] px-[10%] py-20 text-navy">
    <div class="mx-auto mb-9 max-w-[700px] text-center"><p class="mb-3 text-sm font-bold uppercase tracking-[.12em] text-sage">TENAGA MEDIS</p><h2 class="mb-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.2]">Tim yang mendampingi Anda.</h2><p class="text-base leading-relaxed text-[#64748b]">Dokter kami menggabungkan pengalaman klinis dengan komunikasi yang terbuka agar setiap kunjungan terasa jelas dan nyaman.</p></div>
    <div class="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-3">
      <article v-for="(doctor, index) in doctors" :key="doctor.name" class="relative rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]">
        <img class="block h-[260px] w-full rounded-lg object-cover" :src="doctor.photo" :alt="doctor.alt" loading="lazy" decoding="async">
        <span class="mt-4 inline-block rounded-full bg-[#ecfdf5] px-2.5 py-1.5 text-sm font-semibold text-sage-dark">Dokter aktif</span>
        <h3 class="mb-2 mt-3 font-display text-[22px] font-semibold leading-[1.3]">{{ doctor.name }}</h3>
        <p class="mb-1 text-base font-semibold text-[#475569]">{{ doctor.specialty }}</p>
        <p class="text-base leading-relaxed text-[#64748b]">{{ doctor.schedule }}</p>
        <span class="absolute right-6 top-6 text-base text-[#94a3b8]">0{{ index + 1 }}</span>
      </article>
    </div>
  </section>
</template>
