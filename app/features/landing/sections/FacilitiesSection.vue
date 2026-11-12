<script setup lang="ts">
interface Facility {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
}

const { data: facilities } = await usePublicData<Facility[]>('facilities')
</script>

<template>
  <section id="fasilitas" class="scroll-mt-6 bg-white px-[10%] py-20 text-navy">
    <div class="mx-auto mb-9 max-w-[700px] text-center"><p class="mb-3 text-sm font-bold uppercase tracking-[.12em] text-sage">FASILITAS</p><h2 class="mb-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.2]">Ruang untuk merasa nyaman.</h2><p class="text-base leading-relaxed text-[#64748b]">Fasilitas yang mendukung kenyamanan, privasi, dan kebersihan selama Anda berkunjung.</p></div>
    <div v-if="facilities?.length" class="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-3">
      <article v-for="facility in facilities" :key="facility.id" class="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]"><img v-if="facility.imageUrl" class="block h-[220px] w-full rounded-lg object-cover" :src="assetUrl(facility.imageUrl)" :alt="facility.name" loading="lazy" decoding="async"><div v-else class="grid h-[220px] place-items-center rounded-lg bg-[#f1f5f9] text-sage"><span class="text-4xl">+</span></div><h3 class="mb-2 mt-4 font-display text-[22px] font-semibold leading-[1.3]">{{ facility.name }}</h3><p v-if="facility.description" class="text-base leading-relaxed text-[#475569]">{{ facility.description }}</p></article>
    </div>
    <p v-else class="mx-auto max-w-[700px] rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6 text-center text-base text-[#64748b]">Informasi fasilitas akan segera tersedia.</p>
  </section>
</template>
