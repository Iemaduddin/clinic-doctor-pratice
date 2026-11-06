<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAlertLine } from 'oh-vue-icons/icons/ri'

addIcons(RiAlertLine)

const props = withDefaults(defineProps<{
  title: string
  description: string
  confirmLabel?: string
  submitting?: boolean
}>(), {
  confirmLabel: 'Hapus',
  submitting: false
})

const emit = defineEmits<{ confirm: []; cancel: [] }>()
const cancelButton = ref<HTMLButtonElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.submitting) emit('cancel')
}

onMounted(() => {
  cancelButton.value?.focus()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/50 p-4" @click.self="!submitting && emit('cancel')">
    <section class="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_40px_#0f172a33]" role="alertdialog" aria-modal="true" :aria-label="title" aria-describedby="confirm-dialog-description">
      <div class="flex items-start gap-4">
        <span class="grid size-11 shrink-0 place-items-center rounded-full bg-[#fef2f2] text-[#b91c1c]"><OhVueIcon name="ri-alert-line" class="size-5" /></span>
        <div>
          <h2 class="font-display text-xl font-bold text-navy">{{ title }}</h2>
          <p id="confirm-dialog-description" class="mt-2 text-base leading-relaxed text-[#64748b]">{{ description }}</p>
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <button ref="cancelButton" type="button" :disabled="submitting" class="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-base font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc] disabled:opacity-50" @click="emit('cancel')">Batal</button>
        <button type="button" :disabled="submitting" class="rounded-lg bg-[#b91c1c] px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#991b1b] disabled:cursor-wait disabled:opacity-60" @click="emit('confirm')">{{ submitting ? 'Menghapus...' : confirmLabel }}</button>
      </div>
    </section>
  </div>
</template>
