<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine } from 'oh-vue-icons/icons/ri'

addIcons(RiAddLine)

interface FaqItem {
  id: string
  question: string
  answer: string
}

const { data: faqs } = await usePublicData<FaqItem[]>('faqs')
</script>

<template>
  <section id="faq" class="scroll-mt-6 bg-white px-[10%] py-20 text-navy">
    <div class="mx-auto mb-9 max-w-[700px] text-center"><p class="mb-3 text-sm font-bold uppercase tracking-[.12em] text-sage">FAQ</p><h2 class="mb-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.2]">Hal yang sering ditanyakan.</h2><p class="text-base leading-relaxed text-[#64748b]">Jawaban singkat untuk membantu Anda mempersiapkan kunjungan.</p></div>
    <div v-if="faqs?.length" class="mx-auto max-w-[900px] divide-y divide-[#e2e8f0] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_2px_6px_#0f172a0d]">
      <details v-for="faq in faqs" :key="faq.id" class="group">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold transition-colors hover:bg-[#f8fafc] [&::-webkit-details-marker]:hidden">
          <span>{{ faq.question }}</span>
          <span class="grid size-9 shrink-0 place-items-center rounded-full bg-[#ecfdf5] text-sage transition-transform duration-200 group-open:rotate-45"><OhVueIcon name="ri-add-line" /></span>
        </summary>
        <div class="px-6 pb-6"><p class="max-w-[760px] text-base leading-relaxed text-[#475569]">{{ faq.answer }}</p></div>
      </details>
    </div>
    <p v-else class="mx-auto max-w-[700px] rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6 text-center text-base text-[#64748b]">Informasi pertanyaan umum akan segera tersedia.</p>
  </section>
</template>
