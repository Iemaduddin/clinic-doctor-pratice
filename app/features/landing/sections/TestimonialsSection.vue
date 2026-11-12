<script setup lang="ts">
interface Testimonial {
  id: string
  patientName: string
  content: string
  rating: number
}

const { data: testimonials } = await usePublicData<Testimonial[]>('testimonials')
</script>

<template>
  <section id="testimoni" class="scroll-mt-6 bg-[#f8fafc] px-[10%] py-20 text-navy">
    <div class="mx-auto mb-9 max-w-[700px] text-center"><p class="mb-3 text-sm font-bold uppercase tracking-[.12em] text-sage">CERITA PASIEN</p><h2 class="mb-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.2]">Apa kata pasien kami.</h2><p class="text-base leading-relaxed text-[#64748b]">Pengalaman pasien yang berkunjung ke Klinik Sehat.</p></div>
    <div v-if="testimonials?.length" class="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-2">
      <figure v-for="testimonial in testimonials" :key="testimonial.id" class="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]"><div class="flex items-center justify-between gap-4"><span class="inline-block rounded-full bg-[#ecfdf5] px-2.5 py-1.5 text-sm font-semibold text-sage-dark">Ulasan pasien</span><span class="text-sm text-[#eab308]" :aria-label="`${testimonial.rating} dari lima bintang`">{{ '★'.repeat(testimonial.rating) }}{{ '☆'.repeat(5 - testimonial.rating) }}</span></div><blockquote class="my-4 text-lg leading-relaxed text-[#475569]">“{{ testimonial.content }}”</blockquote><figcaption class="text-sm font-semibold text-navy">{{ testimonial.patientName }}</figcaption></figure>
    </div>
    <p v-else class="mx-auto max-w-[700px] rounded-xl border border-[#e2e8f0] bg-white p-6 text-center text-base text-[#64748b]">Cerita pasien akan segera tersedia.</p>
  </section>
</template>
