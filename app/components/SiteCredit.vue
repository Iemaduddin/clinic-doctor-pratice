<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiArrowRightUpLine, RiWhatsappLine } from 'oh-vue-icons/icons/ri'

addIcons(RiArrowRightUpLine, RiWhatsappLine)

const catalogueUrl = 'https://webkecilstudio.github.io/catalogue/'
const whatsappUrl = 'https://wa.me/6282313153539'
</script>

<template>
  <div class="flex flex-col gap-3 border-t border-[#e2e8f0] pt-5 text-sm text-[#64748b] sm:flex-row sm:items-center sm:justify-between">
    <a :href="catalogueUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2.5 transition-colors hover:text-navy">
      <img :src="assetUrl('/images/webkecilstudio.png')" alt="Webkecil Studio" class="size-8 rounded-lg object-contain">
      <span>Dibuat oleh <strong class="text-navy">Webkecil Studio</strong></span>
    </a>
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 font-semibold text-sage-dark transition-colors hover:text-sage">
        <OhVueIcon name="ri-whatsapp-line" aria-hidden="true" /> +62 823-1315-3539
      </a>
      <a :href="catalogueUrl" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 font-semibold text-navy transition-colors hover:text-sage">
        Lihat katalog <OhVueIcon name="ri-arrow-right-up-line" aria-hidden="true" />
      </a>
    </div>
  </div>
</template>
