<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiFileList3Line,
  RiPhoneLine,
  RiTimeLine,
  RiUser3Line,
  RiWhatsappLine
} from 'oh-vue-icons/icons/ri'

addIcons(
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiFileList3Line,
  RiPhoneLine,
  RiTimeLine,
  RiUser3Line,
  RiWhatsappLine
)

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface AdminAppointment {
  id: string
  bookingCode: string
  startAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  note: string | null
  doctor: { name: string; specialization: { name: string } }
  service: { name: string; durationMinutes: number }
  patient: { name: string; phone: string; email: string | null }
}

const statusFilter = ref('')
const pageError = ref('')
const notice = ref('')
const updatingId = ref<string | null>(null)

const { data: appointments, refresh, pending } = await useFetch<AdminAppointment[]>('/api/admin/appointments', {
  query: computed(() => ({ status: statusFilter.value }))
})

async function updateStatus(id: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
  updatingId.value = id
  pageError.value = ''

  try {
    await $fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    notice.value = `Status reservasi berhasil diubah ke ${newStatus}.`
    await refresh()
  } catch (err) {
    pageError.value = apiErrorMessage(err, 'Gagal memperbarui status reservasi.')
  } finally {
    updatingId.value = null
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const h = String((d.getUTCHours() + 7) % 24).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} WIB`
}

useHead({ title: 'Manajemen Reservasi | Klinik Sehat' })
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Manajemen</p>
        <h1 class="font-display text-3xl font-bold text-navy">Reservasi Pasien</h1>
        <p class="mt-2 text-base text-[#64748b]">Pantau dan kelola status reservasi konsultasi pasien.</p>
      </div>

      <!-- Filter tabs -->
      <div class="flex flex-wrap gap-1.5 rounded-xl bg-white p-1.5 border border-[#e2e8f0]">
        <button
          type="button"
          class="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors"
          :class="!statusFilter ? 'bg-navy text-white' : 'text-[#64748b] hover:text-navy'"
          @click="statusFilter = ''"
        >
          Semua
        </button>
        <button
          type="button"
          class="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors"
          :class="statusFilter === 'PENDING' ? 'bg-navy text-white' : 'text-[#64748b] hover:text-navy'"
          @click="statusFilter = 'PENDING'"
        >
          Pending
        </button>
        <button
          type="button"
          class="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors"
          :class="statusFilter === 'CONFIRMED' ? 'bg-navy text-white' : 'text-[#64748b] hover:text-navy'"
          @click="statusFilter = 'CONFIRMED'"
        >
          Confirmed
        </button>
        <button
          type="button"
          class="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors"
          :class="statusFilter === 'COMPLETED' ? 'bg-navy text-white' : 'text-[#64748b] hover:text-navy'"
          @click="statusFilter = 'COMPLETED'"
        >
          Completed
        </button>
        <button
          type="button"
          class="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors"
          :class="statusFilter === 'CANCELLED' ? 'bg-navy text-white' : 'text-[#64748b] hover:text-navy'"
          @click="statusFilter = 'CANCELLED'"
        >
          Cancelled
        </button>
      </div>
    </div>

    <p v-if="pageError" class="mb-4 rounded-xl bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ pageError }}</p>
    <p v-if="notice" class="mb-4 rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ notice }}</p>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xs">
      <div v-if="pending" class="p-8 text-center text-base text-[#64748b]">Memuat data reservasi...</div>
      <div v-else-if="!appointments?.length" class="p-12 text-center">
        <OhVueIcon name="ri-calendar-line" class="mx-auto mb-3 size-12 text-[#cbd5e1]" />
        <p class="text-base font-semibold text-navy">Tidak ada reservasi</p>
        <p class="mt-1 text-sm text-[#64748b]">Belum ada data reservasi dengan filter status ini.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[850px] text-left">
          <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
            <tr>
              <th class="px-5 py-3 font-semibold">Kode & Status</th>
              <th class="px-5 py-3 font-semibold">Pasien</th>
              <th class="px-5 py-3 font-semibold">Dokter & Layanan</th>
              <th class="px-5 py-3 font-semibold">Waktu Konsultasi</th>
              <th class="px-5 py-3 text-right font-semibold">Aksi Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e2e8f0]">
            <tr v-for="item in appointments" :key="item.id" class="align-middle">
              <td class="px-5 py-4">
                <p class="font-mono font-bold text-navy">{{ item.bookingCode }}</p>
                <span
                  class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                  :class="[
                    item.status === 'PENDING'
                      ? 'bg-[#fef3c7] text-[#92400e]'
                      : item.status === 'CONFIRMED'
                      ? 'bg-[#ecfdf5] text-sage-dark'
                      : item.status === 'COMPLETED'
                      ? 'bg-[#eff6ff] text-[#1d4ed8]'
                      : 'bg-[#f1f5f9] text-[#64748b]'
                  ]"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="px-5 py-4">
                <p class="font-semibold text-navy">{{ item.patient.name }}</p>
                <p class="text-xs text-[#64748b]"><a :href="`https://wa.me/${item.patient.phone.replace(/^0/, '62')}`" target="_blank" class="hover:text-sage flex items-center gap-1"><OhVueIcon name="ri-whatsapp-line" /> {{ item.patient.phone }}</a></p>
              </td>
              <td class="px-5 py-4">
                <p class="font-semibold text-navy">{{ item.doctor.name }}</p>
                <p class="text-xs text-[#64748b]">{{ item.service.name }}</p>
              </td>
              <td class="px-5 py-4">
                <p class="text-sm font-semibold text-navy">{{ formatDate(item.startAt) }}</p>
                <p class="text-xs text-[#64748b]">{{ formatTime(item.startAt) }}</p>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <template v-if="item.status === 'PENDING'">
                    <button
                      type="button"
                      :disabled="updatingId === item.id"
                      class="rounded-lg bg-sage px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-sage-dark disabled:opacity-40"
                      @click="updateStatus(item.id, 'CONFIRMED')"
                    >
                      Konfirmasi
                    </button>
                    <button
                      type="button"
                      :disabled="updatingId === item.id"
                      class="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#b91c1c] transition-colors hover:bg-[#fef2f2] disabled:opacity-40"
                      @click="updateStatus(item.id, 'CANCELLED')"
                    >
                      Batalkan
                    </button>
                  </template>
                  <template v-else-if="item.status === 'CONFIRMED'">
                    <button
                      type="button"
                      :disabled="updatingId === item.id"
                      class="rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#020617] disabled:opacity-40"
                      @click="updateStatus(item.id, 'COMPLETED')"
                    >
                      Selesai
                    </button>
                    <button
                      type="button"
                      :disabled="updatingId === item.id"
                      class="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#b91c1c] transition-colors hover:bg-[#fef2f2] disabled:opacity-40"
                      @click="updateStatus(item.id, 'CANCELLED')"
                    >
                      Batalkan
                    </button>
                  </template>
                  <span v-else class="text-xs font-medium text-[#94a3b8]">Terkunci ({{ item.status }})</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
