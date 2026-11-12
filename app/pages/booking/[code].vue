<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiHeartPulseLine,
  RiPrinterLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiWhatsappLine
} from 'oh-vue-icons/icons/ri'

addIcons(
  RiArrowLeftLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiHeartPulseLine,
  RiPrinterLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiWhatsappLine
)

interface AppointmentDetail {
  id: string
  bookingCode: string
  startAt: string
  endAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  note: string | null
  doctor: {
    name: string
    photoUrl: string | null
    specialization: { name: string }
  }
  service: {
    name: string
    durationMinutes: number
  }
  patient: {
    name: string
    phone: string
    email: string | null
  }
}

const route = useRoute()
const code = computed(() => String(route.params.code || '').toUpperCase())

const { data: appointment, refresh, error } = await useAsyncData<AppointmentDetail | null>(
  `appointment-${code.value}`,
  () =>
    isDemoMode()
      ? Promise.resolve(demoAppointment(code.value) ?? null)
      : $fetch<AppointmentDetail>(`/api/public/appointments/${code.value}`)
)

const showCancelModal = ref(false)
const cancelPhone = ref('')
const cancelling = ref(false)
const cancelError = ref('')
const cancelNotice = ref('')

const formattedDate = computed(() => {
  if (!appointment.value?.startAt) return ''
  const d = new Date(appointment.value.startAt)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  })
})

const formattedTime = computed(() => {
  if (!appointment.value?.startAt) return ''
  const d = new Date(appointment.value.startAt)
  const h = String((d.getUTCHours() + 7) % 24).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m} WIB`
})

const waLink = computed(() => {
  if (!appointment.value) return '#'
  const text = encodeURIComponent(
    `Halo Klinik Sehat, saya ingin mengonfirmasi reservasi online.\n\nKode Booking: ${appointment.value.bookingCode}\nNama: ${appointment.value.patient.name}\nDokter: ${appointment.value.doctor.name}\nJadwal: ${formattedDate.value} jam ${formattedTime.value}`
  )
  return `https://wa.me/6281234567890?text=${text}`
})

async function cancelBooking() {
  cancelling.value = true
  cancelError.value = ''

  try {
    if (isDemoMode()) {
      demoCancelAppointment(code.value, cancelPhone.value)
    } else {
      await $fetch(`/api/public/appointments/${code.value}/cancel`, {
        method: 'POST',
        body: { phone: cancelPhone.value }
      })
    }
    cancelNotice.value = 'Reservasi berhasil dibatalkan.'
    showCancelModal.value = false
    await refresh()
  } catch (err) {
    cancelError.value = apiErrorMessage(err, 'Gagal membatalkan reservasi. Pastikan nomor HP sesuai.')
  } finally {
    cancelling.value = false
  }
}

function printPage() {
  window.print()
}

useHead({ title: computed(() => `Reservasi ${code.value} | Klinik Sehat`) })
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-navy print:min-h-0 print:bg-white print:font-sans">
    <!-- Header -->
    <header class="border-b border-[#e2e8f0] bg-white print:hidden">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-display text-lg font-bold">
          <span class="grid size-9 place-items-center rounded-xl bg-sage text-white"><OhVueIcon name="ri-heart-pulse-line" class="size-5" /></span>
          Klinik Sehat
        </NuxtLink>
        <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748b] hover:text-navy">
          <OhVueIcon name="ri-arrow-left-line" /> Beranda
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 print:max-w-none print:px-0 print:py-0">
      <div v-if="error || !appointment" class="rounded-2xl border border-[#fef2f2] bg-white p-8 text-center shadow-sm">
        <OhVueIcon name="ri-close-line" class="mx-auto mb-3 size-12 text-[#b91c1c]" />
        <h1 class="font-display text-2xl font-bold text-navy">Reservasi Tidak Ditemukan</h1>
        <p class="mt-2 text-base text-[#64748b]">Kode rujukan <span class="font-mono font-bold text-navy">{{ code }}</span> tidak cocok dengan data kami.</p>
        <NuxtLink to="/booking" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-base font-bold text-white hover:bg-[#020617]">
          Buat Reservasi Baru
        </NuxtLink>
      </div>

      <div v-else>
        <!-- Notice if cancelled -->
        <p v-if="cancelNotice" class="mb-6 rounded-xl bg-[#ecfdf5] p-4 text-sm font-semibold text-sage-dark print:hidden" role="status">
          {{ cancelNotice }}
        </p>

        <!-- Main Confirmation Card -->
        <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm print:border-none print:shadow-none">
          <!-- Banner -->
          <div
            class="p-6 sm:p-8 text-white"
            :class="[
              appointment.status === 'PENDING'
                ? 'bg-navy'
                : appointment.status === 'CONFIRMED'
                ? 'bg-sage'
                : appointment.status === 'CANCELLED'
                ? 'bg-[#64748b]'
                : 'bg-[#1e293b]'
            ]"
          >
            <div class="flex items-center justify-between gap-4">
              <div>
                <span class="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Status: {{ appointment.status }}
                </span>
                <p class="mt-2 font-mono text-3xl font-bold tracking-wider text-white sm:text-4xl">{{ appointment.bookingCode }}</p>
                <p class="mt-1 text-sm text-white/80">Simpan atau simpan tangkapan layar kode booking ini.</p>
              </div>
              <button
                type="button"
                class="hidden sm:inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 print:hidden"
                @click="printPage"
              >
                <OhVueIcon name="ri-printer-line" /> Cetak Bukti
              </button>
            </div>
          </div>

          <!-- Body details -->
          <div class="p-6 sm:p-8 space-y-6">
            <!-- Doctor & Service -->
            <div class="flex items-start gap-4 border-b border-[#e2e8f0] pb-6">
              <img v-if="appointment.doctor.photoUrl" :src="assetUrl(appointment.doctor.photoUrl)" :alt="appointment.doctor.name" class="size-14 rounded-full object-cover border border-[#e2e8f0] print:hidden">
              <div v-else class="grid size-14 place-items-center rounded-full bg-[#f1f5f9] text-navy"><OhVueIcon name="ri-stethoscope-line" class="size-7" /></div>
              <div>
                <p class="font-display text-xl font-bold text-navy">{{ appointment.doctor.name }}</p>
                <p class="text-sm font-medium text-sage-dark">{{ appointment.doctor.specialization.name }}</p>
                <p class="mt-1.5 text-base font-semibold text-[#475569]">{{ appointment.service.name }} (~{{ appointment.service.durationMinutes }} menit)</p>
              </div>
            </div>

            <!-- Schedule info -->
            <div class="grid gap-4 sm:grid-cols-2 border-b border-[#e2e8f0] pb-6">
              <div class="rounded-xl bg-[#f8fafc] p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Hari & Tanggal</p>
                <p class="mt-1 flex items-center gap-2 text-base font-bold text-navy">
                  <OhVueIcon name="ri-calendar-line" class="text-sage" /> {{ formattedDate }}
                </p>
              </div>
              <div class="rounded-xl bg-[#f8fafc] p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Jam Sesi</p>
                <p class="mt-1 flex items-center gap-2 text-base font-bold text-navy">
                  <OhVueIcon name="ri-time-line" class="text-sage" /> {{ formattedTime }}
                </p>
              </div>
            </div>

            <!-- Patient info -->
            <div class="space-y-2">
              <p class="text-sm font-semibold uppercase tracking-wider text-[#94a3b8]">Identitas Pasien</p>
              <div class="grid gap-2 text-base text-navy sm:grid-cols-2">
                <p><span class="text-[#64748b]">Nama:</span> <span class="font-semibold">{{ appointment.patient.name }}</span></p>
                <p><span class="text-[#64748b]">WhatsApp:</span> <span class="font-semibold">{{ appointment.patient.phone }}</span></p>
                <p v-if="appointment.patient.email"><span class="text-[#64748b]">Email:</span> <span class="font-semibold">{{ appointment.patient.email }}</span></p>
                <p v-if="appointment.note" class="sm:col-span-2"><span class="text-[#64748b]">Catatan:</span> <span class="italic text-[#475569]">{{ appointment.note }}</span></p>
              </div>
            </div>

            <!-- Action buttons -->
            <div v-if="appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'" class="flex flex-col gap-3 pt-4 sm:flex-row print:hidden">
              <a
                :href="waLink"
                target="_blank"
                rel="noopener"
                class="flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25d366] px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#128c7e]"
              >
                <OhVueIcon name="ri-whatsapp-line" class="size-5" /> Konfirmasi ke WhatsApp Klinik
              </a>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] px-5 py-3.5 text-base font-semibold text-[#b91c1c] transition-colors hover:bg-[#fef2f2]"
                @click="showCancelModal = true"
              >
                Batalkan Reservasi
              </button>
            </div>
          </div>
        </div>

        <!-- Cancel modal -->
        <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 p-4" @click.self="showCancelModal = false">
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 class="font-display text-xl font-bold text-navy">Pembatalan Reservasi</h3>
            <p class="mt-2 text-sm text-[#64748b]">Masukkan nomor WhatsApp yang Anda gunakan saat mendaftar untuk mengonfirmasi pembatalan.</p>

            <form class="mt-4 space-y-4" @submit.prevent="cancelBooking">
              <div>
                <label class="mb-1 block text-sm font-semibold text-navy" for="cancel-phone">Nomor WhatsApp</label>
                <input id="cancel-phone" v-model="cancelPhone" required class="h-[44px] w-full rounded-xl border border-[#e2e8f0] px-3.5 text-base text-navy outline-none focus:border-navy" placeholder="Contoh: 081234567890">
              </div>

              <p v-if="cancelError" class="rounded-lg bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">{{ cancelError }}</p>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" class="rounded-xl border border-[#e2e8f0] px-4 py-2 text-base font-semibold text-[#475569] hover:bg-[#f8fafc]" @click="showCancelModal = false">Batal</button>
                <button type="submit" :disabled="cancelling || !cancelPhone" class="rounded-xl bg-[#b91c1c] px-5 py-2 text-base font-bold text-white hover:bg-[#991b1b] disabled:opacity-40">
                  {{ cancelling ? 'Membatalkan...' : 'Ya, Batalkan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
