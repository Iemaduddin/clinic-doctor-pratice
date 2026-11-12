<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine, RiArrowDownLine, RiArrowRightUpLine, RiHealthBookLine, RiHeartPulseLine, RiMapPin2Line, RiStethoscopeLine, RiTimeLine } from 'oh-vue-icons/icons/ri'

addIcons(RiAddLine, RiArrowDownLine, RiArrowRightUpLine, RiHealthBookLine, RiHeartPulseLine, RiMapPin2Line, RiStethoscopeLine, RiTimeLine)

interface PublicService {
  id: string
  name: string
  description: string | null
  durationMinutes: number
}

const { data: services } = await useFetch<PublicService[]>('/api/public/services')
</script>

<template>
  <div class="mx-auto min-h-screen max-w-[1440px] overflow-hidden bg-[#f8fafc] font-sans text-navy">
    <header class="flex h-[88px] items-center justify-between border-b border-[#e2e8f0] px-[7.2%] max-md:h-[70px] max-md:px-[6%]">
      <a class="flex items-center gap-2.5 font-display text-[15px] font-extrabold tracking-[.08em]" href="#home" aria-label="Klinik Sehat home">
        <span class="grid size-8 place-items-center rounded-lg border border-sage text-xl text-sage"><OhVueIcon name="ri-add-line" /></span>
        <span>KLINIK<span class="font-normal text-[#64748b]">SEHAT</span></span>
      </a>
      <nav class="hidden gap-7 text-sm text-[#64748b] md:flex" aria-label="Navigasi utama">
        <a class="transition-colors hover:text-sage" href="#layanan">Layanan</a>
        <a class="transition-colors hover:text-sage" href="#dokter">Dokter</a>
        <a class="transition-colors hover:text-sage" href="#jadwal">Jadwal</a>
        <a class="transition-colors hover:text-sage" href="#fasilitas">Fasilitas</a>
        <a class="transition-colors hover:text-sage" href="#testimoni">Testimoni</a>
        <a class="transition-colors hover:text-sage" href="#lokasi">Lokasi</a>
        <a class="transition-colors hover:text-sage" href="#faq">FAQ</a>
      </nav>
      <NuxtLink class="inline-flex items-center gap-3 rounded-lg bg-navy px-3.5 py-1.5 text-sm font-bold text-white transition-colors hover:bg-[#020617]" to="/booking">Buat Janji <OhVueIcon name="ri-arrow-right-up-line" aria-hidden="true" /></NuxtLink>
    </header>

    <main id="home">
      <section class="grid min-h-[600px] items-center gap-[5%] px-[8%] pb-[70px] pt-[72px] max-md:grid-cols-1 max-md:gap-10 max-md:pt-14 md:grid-cols-2">
        <div>
          <p class="mb-6 text-sm font-bold uppercase tracking-[.17em] text-sage"><span class="mr-2 inline-block size-2 rounded-full bg-[#22c55e]"></span>Perawatan terpercaya, setiap hari</p>
          <h1 class="font-display text-[clamp(40px,5vw,56px)] font-bold leading-[1.15] tracking-[-.035em]">Kesehatan Anda <br /><span class="text-sage">Prioritas Kami</span></h1>
          <p class="mb-7 mt-6 max-w-[430px] text-base leading-[1.8] text-[#475569]">Perawatan yang penuh perhatian dari tenaga medis berpengalaman. Kami hadir untuk membantu Anda dan keluarga hidup lebih sehat.</p>
          <div class="flex items-center gap-6">
            <NuxtLink class="inline-flex items-center gap-4 rounded-lg bg-navy px-7 py-3 text-base font-bold text-white transition-colors hover:bg-[#020617]" to="/booking">Jadwalkan konsultasi <OhVueIcon name="ri-arrow-right-up-line" aria-hidden="true" /></NuxtLink>
            <a class="inline-flex items-center gap-2 text-base font-semibold text-navy transition-colors hover:text-sage" href="#layanan">Jelajahi layanan <OhVueIcon name="ri-arrow-down-line" aria-hidden="true" /></a>
          </div>
          <div class="mt-13 flex items-center gap-3.5">
            <p class="text-base leading-relaxed"><strong>Dipercaya 2.000+ pasien</strong><br /><span class="text-[#475569]">Perawatan hangat, hasil bermakna</span></p>
          </div>
        </div>
        <div class="relative h-[430px] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[radial-gradient(ellipse_at_50%_45%,#d1fae5_0,#ecfdf5_38%,#f1f5f9_78%)] max-md:h-[350px]" role="img" aria-label="Dokter siap membantu kesehatan Anda">
          <div class="absolute inset-0 bg-[linear-gradient(#0f172a0a_1px,transparent_1px),linear-gradient(90deg,#0f172a0a_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(transparent,#000_30%,#000_80%,transparent)]"></div>
          <div class="absolute left-1/2 top-[46%] size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sage/20"></div>
          <div class="absolute left-1/2 top-[46%] size-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#22c55e55]"></div>
          <div class="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 text-[170px] font-extralight text-sage opacity-20">+</div>
          <div class="absolute bottom-[23%] left-[8%] flex items-center gap-2.5 rounded-lg border border-[#e2e8f0] bg-white p-3 shadow-[0_4px_16px_#0f172a12]">
            <div class="grid size-9 place-items-center rounded-full bg-[#d1fae5] text-sm font-bold text-sage">DR</div>
            <div><strong class="block text-sm">Tim medis profesional</strong><span class="mt-1 block text-sm text-[#64748b]">Siap mendampingi Anda</span></div>
            <span class="ml-1.5 text-sm text-[#16a34a]">✓</span>
          </div>
          <div class="absolute right-[7%] top-[14%] flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-3 shadow-[0_4px_16px_#0f172a12]"><span class="inline-block size-2 rounded-full bg-[#22c55e]"></span><div><strong class="block text-sm">Konsultasi tersedia</strong><span class="mt-1 block text-sm text-[#64748b]">Pilih jadwal dokter</span></div></div>
          <div class="absolute bottom-5 left-[22px] right-[22px] flex justify-between text-sm tracking-[.13em] text-[#64748b]">KEPEDULIAN DALAM SETIAP PERAWATAN <span class="text-sm">01 / 03</span></div>
        </div>
      </section>

      <section class="grid gap-5 border-y border-[#e2e8f0] px-[10%] py-6 max-md:grid-cols-1 md:grid-cols-3" aria-label="Keunggulan klinik">
        <div class="flex items-center gap-3.5"><span class="grid size-10 place-items-center rounded-lg border border-[#e2e8f0] text-xl text-sage"><OhVueIcon name="ri-stethoscope-line" /></span><p class="text-base"><strong class="block">Dokter berpengalaman</strong><span class="block text-sm text-[#64748b]">Tenaga medis profesional</span></p></div>
        <div class="flex items-center gap-3.5"><span class="grid size-10 place-items-center rounded-lg border border-[#e2e8f0] text-xl text-sage"><OhVueIcon name="ri-time-line" /></span><p class="text-base"><strong class="block">Jadwal fleksibel</strong><span class="block text-sm text-[#64748b]">Pilih waktu yang nyaman</span></p></div>
        <div class="flex items-center gap-3.5"><span class="grid size-10 place-items-center rounded-lg border border-[#e2e8f0] text-xl text-sage"><OhVueIcon name="ri-map-pin-2-line" /></span><p class="text-base"><strong class="block">Lokasi strategis</strong><span class="block text-sm text-[#64748b]">Mudah dijangkau keluarga</span></p></div>
      </section>

      <section id="layanan" class="px-[8%] py-20">
        <div class="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p class="mb-[18px] text-sm font-bold uppercase tracking-[.17em] text-sage">LAYANAN KAMI</p><h2 class="font-display text-[40px] font-semibold leading-[1.15] tracking-[-.035em]">Perawatan untuk setiap<br />tahap kehidupan.</h2></div>
          <a class="inline-flex items-center gap-2 text-base font-semibold text-navy transition-colors hover:text-sage" href="#jadwal">Lihat jadwal layanan <OhVueIcon name="ri-arrow-right-up-line" aria-hidden="true" /></a>
        </div>
        <div v-if="services?.length" class="grid gap-4 md:grid-cols-3">
          <article v-for="(service, index) in services" :key="service.id" class="relative min-h-[225px] rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]"><span class="text-2xl text-sage"><OhVueIcon :name="index % 2 ? 'ri-health-book-line' : 'ri-heart-pulse-line'" /></span><span class="absolute right-6 top-6 font-mono text-sm text-[#64748b]">{{ String(index + 1).padStart(2, '0') }}</span><h3 class="mb-2 mt-7 font-display text-[17px] font-semibold">{{ service.name }}</h3><p class="max-w-[245px] text-base leading-[1.7] text-[#475569]">{{ service.description || `Layanan konsultasi medis dengan durasi sekitar ${service.durationMinutes} menit.` }}</p><NuxtLink class="absolute bottom-5 right-6 text-sage" :to="`/booking?service=${service.id}`" :aria-label="`Buat janji untuk ${service.name}`"><OhVueIcon name="ri-arrow-right-up-line" /></NuxtLink></article>
        </div>
        <p v-else class="rounded-xl border border-[#e2e8f0] bg-white p-6 text-center text-base text-[#64748b]">Informasi layanan akan segera tersedia.</p>
      </section>

      <section id="tentang" class="border-y border-[#e2e8f0] bg-white px-[15%] py-16 text-center"><p class="font-serif text-[56px] text-sage">“</p><blockquote class="mx-auto mb-6 max-w-[740px] font-display text-[clamp(22px,3vw,35px)] font-medium leading-[1.5] tracking-[-.03em]">Kami percaya, pelayanan kesehatan terbaik dimulai dari <em class="not-italic text-sage">mendengarkan.</em></blockquote><span class="text-sm tracking-[.16em] text-[#64748b]">KLINIK SEHAT — PEDULI SEPENUH HATI</span></section>

      <DoctorsSection />
      <ScheduleSection />
      <FacilitiesSection />
      <TestimonialsSection />
      <FAQSection />
      <LocationSection />
    </main>

    <footer id="kontak" class="flex flex-col justify-between gap-4 px-[10%] pb-7 pt-14 text-sm text-[#64748b] md:flex-row md:items-center"><a class="flex items-center gap-2.5 font-display text-[15px] font-extrabold tracking-[.08em] text-navy" href="#home"><span class="grid size-8 place-items-center rounded-lg border border-sage text-xl text-sage"><OhVueIcon name="ri-add-line" /></span><span>KLINIK<span class="font-normal text-[#64748b]">SEHAT</span></span></a><p class="text-base">Merawat dengan hati, melayani dengan sepenuh hati.</p><span class="text-sm">© 2026 Klinik Sehat</span></footer>
  </div>
</template>
