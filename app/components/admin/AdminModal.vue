<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiCloseLine } from 'oh-vue-icons/icons/ri'

addIcons(RiCloseLine)

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 p-4" role="dialog" aria-modal="true" :aria-label="title" @click.self="emit('close')">
    <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_8px_32px_#0f172a1a]">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h2 class="font-display text-2xl font-semibold text-navy">{{ title }}</h2>
        <button type="button" class="grid size-9 place-items-center rounded-full bg-[#f1f5f9] text-[#475569] transition-colors hover:bg-[#e2e8f0]" aria-label="Tutup" @click="emit('close')"><OhVueIcon name="ri-close-line" /></button>
      </div>
      <slot />
    </div>
  </div>
</template>
