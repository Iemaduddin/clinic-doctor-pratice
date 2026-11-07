<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiCalendarCheckLine, RiCheckLine, RiCloseLine } from 'oh-vue-icons/icons/ri'

addIcons(RiCalendarCheckLine, RiCheckLine, RiCloseLine)

definePageMeta({ layout: 'doctor', middleware: 'doctor' })

interface DoctorAppointment {
  id: string
  bookingCode: string
  startAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  note: string | null
  service: { name: string; durationMinutes: number }
  patient: { name: string; phone: string; email: string | null }
}

const statusFilter = ref('')
const pageError = ref('')
const notice = ref('')
const updatingId = ref<string | null>(null)
const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const

const { data: appointments, refresh, pending } = await useFetch<DoctorAppointment[]>('/api/doctor/appointments', {
  query: computed(() => ({ status: statusFilter.value }))
})

async function updateStatus(id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
  updatingId.value = id
  pageError.value = ''
  try {
    await $fetch(`/api/doctor/appointments/${id}`, { method: 'PATCH', body: { status } })
    notice.value = 'Status reservasi diperbarui.'
    await refresh()
  } catch (error) {
    pageError.value = apiErrorMessage(error, 'Gagal memperbarui status.')
  } finally {
    updatingId.value = null
  }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

useHead({ title: 'Reservasi Dokter | Klinik Sehat' })
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Portal Dokter</p>
        <h1 class="font-display text-3xl font-bold text-navy">Reservasi</h1>
        <p class="mt-2 text-base text-[#64748b]">Kelola reservasi pasien untuk jadwal Anda.</p>
      </div>
      <div class="flex flex-wrap gap-1.5 rounded-xl border border-[#e2e8f0] bg-white p-1.5">
        <button type="button" class="rounded-lg px-3 py-1.5 text-sm font-semibold" :class="!statusFilter ? 'bg-navy text-white' : 'text-[#64748b]'" @click="statusFilter = ''">Semua</button>
        <button v-for="item in statuses" :key="item" type="button" class="rounded-lg px-3 py-1.5 text-sm font-semibold" :class="statusFilter === item ? 'bg-navy text-white' : 'text-[#64748b]'" @click="statusFilter = item">{{ item }}</button>
      </div>
    </div>

    <p v-if="pageError" class="mb-4 rounded-xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ pageError }}</p>
    <p v-if="notice" class="mb-4 rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ notice }}</p>

    <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <div v-if="pending" class="p-8 text-center text-[#64748b]">Memuat reservasi...</div>
      <div v-else-if="!appointments?.length" class="p-12 text-center">
        <OhVueIcon name="ri-calendar-check-line" class="mx-auto mb-3 size-12 text-[#cbd5e1]" />
        <p class="font-semibold text-navy">Tidak ada reservasi</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left">
          <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
            <tr><th class="px-5 py-3 font-semibold">Jadwal</th><th class="px-5 py-3 font-semibold">Pasien</th><th class="px-5 py-3 font-semibold">Layanan</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr>
          </thead>
          <tbody class="divide-y divide-[#e2e8f0]">
            <tr v-for="item in appointments" :key="item.id">
              <td class="px-5 py-4"><p class="font-semibold text-navy">{{ formatDateTime(item.startAt) }}</p><p class="text-xs text-[#94a3b8]">{{ item.bookingCode }}</p></td>
              <td class="px-5 py-4"><p class="font-medium text-navy">{{ item.patient.name }}</p><p class="text-sm text-[#64748b]">{{ item.patient.phone }}</p></td>
              <td class="px-5 py-4 text-[#475569]">{{ item.service.name }}</td>
              <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="{ 'bg-[#fef3c7] text-[#b45309]': item.status === 'PENDING', 'bg-[#ecfdf5] text-sage-dark': item.status === 'CONFIRMED' || item.status === 'COMPLETED', 'bg-[#f1f5f9] text-[#64748b]': item.status === 'CANCELLED' }">{{ item.status }}</span></td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button v-if="item.status === 'PENDING'" type="button" :disabled="updatingId === item.id" class="grid size-9 place-items-center rounded-lg text-sage-dark hover:bg-[#ecfdf5] disabled:opacity-40" aria-label="Konfirmasi reservasi" @click="updateStatus(item.id, 'CONFIRMED')"><OhVueIcon name="ri-check-line" /></button>
                  <button v-if="item.status === 'CONFIRMED'" type="button" :disabled="updatingId === item.id" class="grid size-9 place-items-center rounded-lg text-sage-dark hover:bg-[#ecfdf5] disabled:opacity-40" aria-label="Selesaikan reservasi" @click="updateStatus(item.id, 'COMPLETED')"><OhVueIcon name="ri-check-line" /></button>
                  <button v-if="item.status === 'PENDING' || item.status === 'CONFIRMED'" type="button" :disabled="updatingId === item.id" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] hover:bg-[#fef2f2] disabled:opacity-40" aria-label="Batalkan reservasi" @click="updateStatus(item.id, 'CANCELLED')"><OhVueIcon name="ri-close-line" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
