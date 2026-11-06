<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiMapPin2Line, RiPhoneLine, RiWhatsappLine } from 'oh-vue-icons/icons/ri'

addIcons(RiMapPin2Line, RiPhoneLine, RiWhatsappLine)

interface ClinicProfile {
  name: string
  address: string
  phone: string
  whatsapp: string
  email: string
  mapsUrl: string | null
}

const { data: clinic } = await useFetch<ClinicProfile>('/api/public/clinic')

function toDigits(phone: string) {
  return phone.replace(/[^0-9]/g, '').replace(/^0/, '62')
}
</script>

<template>
  <section id="lokasi" class="scroll-mt-6 bg-[#f8fafc] px-[10%] py-20 text-navy">
    <div class="mx-auto mb-9 max-w-[700px] text-center"><p class="mb-3 text-sm font-bold uppercase tracking-[.12em] text-sage">LOKASI & KONTAK</p><h2 class="mb-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.2]">Temukan kami.</h2><p class="text-base leading-relaxed text-[#64748b]">Kunjungi {{ clinic?.name || 'klinik' }} atau hubungi tim kami untuk kebutuhan kunjungan Anda.</p></div>
    <div v-if="clinic" class="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-2">
      <article class="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]">
        <span class="grid size-12 place-items-center rounded-xl bg-[#ecfdf5] text-2xl text-sage"><OhVueIcon name="ri-map-pin-2-line" /></span>
        <h3 class="mb-2 mt-4 font-display text-[22px] font-semibold leading-[1.3]">Alamat klinik</h3>
        <p class="mb-4 text-base leading-relaxed text-[#475569]">{{ clinic.address }}</p>
        <a v-if="clinic.mapsUrl" class="inline-flex items-center gap-2 text-base font-semibold text-sage transition-colors hover:text-sage-dark" :href="clinic.mapsUrl" target="_blank" rel="noreferrer">Buka di Google Maps</a>
      </article>
      <article class="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_6px_#0f172a0d]">
        <span class="grid size-12 place-items-center rounded-xl bg-[#ecfdf5] text-2xl text-sage"><OhVueIcon name="ri-phone-line" /></span>
        <h3 class="mb-2 mt-4 font-display text-[22px] font-semibold leading-[1.3]">Telepon & WhatsApp</h3>
        <p class="mb-3 text-base leading-relaxed text-[#475569]">{{ clinic.phone }}<br>{{ clinic.email }}</p>
        <div class="flex flex-wrap gap-4">
          <a class="inline-flex items-center gap-2 text-base font-semibold text-sage transition-colors hover:text-sage-dark" :href="`tel:${clinic.phone}`"><OhVueIcon name="ri-phone-line" />Telepon</a>
          <a class="inline-flex items-center gap-2 text-base font-semibold text-sage transition-colors hover:text-sage-dark" :href="`https://wa.me/${toDigits(clinic.whatsapp)}`" target="_blank" rel="noreferrer"><OhVueIcon name="ri-whatsapp-line" />WhatsApp</a>
        </div>
      </article>
    </div>
    <p v-else class="mx-auto max-w-[700px] rounded-xl border border-[#e2e8f0] bg-white p-6 text-center text-base text-[#64748b]">Informasi lokasi dan kontak akan segera tersedia.</p>
  </section>
</template>
