<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckLine,
  RiHeartPulseLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiWhatsappLine
} from 'oh-vue-icons/icons/ri'

addIcons(
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckLine,
  RiHeartPulseLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiWhatsappLine
)

interface DoctorItem {
  id: string
  name: string
  photoUrl: string | null
  slotDurationMinutes: number
  specialization: { id: string; name: string }
  schedules: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>
}

interface ServiceItem {
  id: string
  name: string
  description: string | null
  durationMinutes: number
}

interface SlotItem {
  time: string
  startAt: string
  available: boolean
}

const route = useRoute()
const router = useRouter()

const { data: doctors } = await usePublicData<DoctorItem[]>('doctors')
const { data: services } = await usePublicData<ServiceItem[]>('services')

const step = ref(1)
const selectedDoctorId = ref<string>(String(route.query.doctor || ''))
const selectedServiceId = ref<string>(String(route.query.service || ''))
const selectedDate = ref<string>(new Date().toISOString().slice(0, 10))
const selectedTime = ref<string>('')

const patientName = ref('')
const patientPhone = ref('')
const patientEmail = ref('')
const note = ref('')

const submitting = ref(false)
const bookingError = ref('')

const slots = ref<SlotItem[]>([])
const loadingSlots = ref(false)

async function refreshSlots() {
  selectedTime.value = ''
  if (!selectedDoctorId.value || !selectedDate.value) {
    slots.value = []
    return
  }
  loadingSlots.value = true
  try {
    const demoDoctor = isDemoMode() ? doctors.value?.find((item) => item.id === selectedDoctorId.value) : undefined
    slots.value = demoDoctor
      ? demoSlots(demoDoctor, selectedDate.value)
      : await $fetch<SlotItem[]>('/api/public/slots', {
          query: { doctorId: selectedDoctorId.value, date: selectedDate.value }
        })
  } catch {
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

watch([selectedDoctorId, selectedDate], refreshSlots, { immediate: true })

// Auto select first doctor and service if query params or list loaded
onMounted(() => {
  if (!selectedDoctorId.value && doctors.value?.length) {
    selectedDoctorId.value = doctors.value[0]!.id
  }
  if (!selectedServiceId.value && services.value?.length) {
    selectedServiceId.value = services.value[0]!.id
  }
})

const selectedDoctor = computed(() => doctors.value?.find((d) => d.id === selectedDoctorId.value))
const selectedService = computed(() => services.value?.find((s) => s.id === selectedServiceId.value))

const minDate = computed(() => new Date().toISOString().slice(0, 10))
const maxDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
})

async function submitBooking() {
  if (!selectedDoctorId.value || !selectedServiceId.value || !selectedDate.value || !selectedTime.value) return
  submitting.value = true
  bookingError.value = ''

  try {
    const res = isDemoMode()
      ? demoCreateAppointment({
          doctor: selectedDoctor.value!,
          service: selectedService.value!,
          date: selectedDate.value,
          startTime: selectedTime.value,
          patientName: patientName.value,
          patientPhone: patientPhone.value,
          patientEmail: patientEmail.value || null,
          note: note.value || null
        })
      : await $fetch<{ bookingCode: string }>('/api/public/appointments', {
          method: 'POST',
          body: {
            doctorId: selectedDoctorId.value,
            serviceId: selectedServiceId.value,
            date: selectedDate.value,
            startTime: selectedTime.value,
            patientName: patientName.value,
            patientPhone: patientPhone.value,
            patientEmail: patientEmail.value || null,
            note: note.value || null
          }
        })

    await router.push(`/booking/${res.bookingCode}`)
  } catch (error) {
    bookingError.value = apiErrorMessage(error, 'Gagal membuat reservasi. Silakan coba waktu lain.')
  } finally {
    submitting.value = false
  }
}

useHead({ title: 'Buat Reservasi Konsultasi | Klinik Sehat' })
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-navy">
    <!-- Header -->
    <header class="border-b border-[#e2e8f0] bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-display text-lg font-bold">
          <span class="grid size-9 place-items-center rounded-xl bg-sage text-white"><OhVueIcon name="ri-heart-pulse-line" class="size-5" /></span>
          Klinik Sehat
        </NuxtLink>
        <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748b] hover:text-navy">
          <OhVueIcon name="ri-arrow-left-line" /> Kembali ke Beranda
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <!-- Title -->
      <div class="mb-8 text-center">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf5] px-3.5 py-1 text-xs font-semibold text-sage-dark">
          <OhVueIcon name="ri-shield-check-line" /> Reservasi Online Langsung
        </span>
        <h1 class="mt-3 font-display text-3xl font-bold text-navy sm:text-4xl">Reservasi Konsultasi</h1>
        <p class="mt-2 text-base text-[#64748b]">Pilih dokter, tanggal, dan jam konsultasi tanpa perlu mengantre.</p>
      </div>

      <!-- Stepper indicator -->
      <div class="mb-8 flex items-center justify-center gap-2 text-sm font-semibold">
        <div class="flex items-center gap-2" :class="step >= 1 ? 'text-sage-dark' : 'text-[#94a3b8]'">
          <span class="grid size-7 place-items-center rounded-full text-xs" :class="step >= 1 ? 'bg-sage text-white' : 'bg-[#e2e8f0] text-[#64748b]'">1</span> Dokter & Layanan
        </div>
        <span class="text-[#cbd5e1]">—</span>
        <div class="flex items-center gap-2" :class="step >= 2 ? 'text-sage-dark' : 'text-[#94a3b8]'">
          <span class="grid size-7 place-items-center rounded-full text-xs" :class="step >= 2 ? 'bg-sage text-white' : 'bg-[#e2e8f0] text-[#64748b]'">2</span> Waktu Sesi
        </div>
        <span class="text-[#cbd5e1]">—</span>
        <div class="flex items-center gap-2" :class="step >= 3 ? 'text-sage-dark' : 'text-[#94a3b8]'">
          <span class="grid size-7 place-items-center rounded-full text-xs" :class="step >= 3 ? 'bg-sage text-white' : 'bg-[#e2e8f0] text-[#64748b]'">3</span> Data Pasien
        </div>
      </div>

      <!-- Step 1: Doctor & Service Selection -->
      <div v-if="step === 1" class="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
        <h2 class="font-display text-xl font-bold text-navy">1. Pilih Dokter & Layanan</h2>
        <p class="mt-1 text-sm text-[#64748b]">Pilih tenaga medis dan jenis konsultasi yang Anda butuhkan.</p>

        <!-- Doctors grid -->
        <div class="mt-6">
          <label class="mb-2 block text-sm font-semibold text-navy">Pilih Dokter</label>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="doctor in doctors"
              :key="doctor.id"
              class="flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 transition-all"
              :class="selectedDoctorId === doctor.id ? 'border-sage bg-[#ecfdf5] shadow-xs' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'"
              @click="selectedDoctorId = doctor.id"
            >
              <img v-if="doctor.photoUrl" :src="assetUrl(doctor.photoUrl)" :alt="doctor.name" class="size-12 rounded-full object-cover">
              <div v-else class="grid size-12 place-items-center rounded-full bg-[#f1f5f9] text-navy"><OhVueIcon name="ri-stethoscope-line" class="size-6" /></div>
              <div class="flex-1 min-w-0">
                <p class="truncate font-semibold text-navy">{{ doctor.name }}</p>
                <p class="truncate text-xs font-medium text-sage-dark">{{ doctor.specialization.name }}</p>
              </div>
              <div class="grid size-5 place-items-center rounded-full border" :class="selectedDoctorId === doctor.id ? 'border-sage bg-sage text-white' : 'border-[#cbd5e1]'">
                <OhVueIcon v-if="selectedDoctorId === doctor.id" name="ri-check-line" class="size-3.5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Services grid -->
        <div class="mt-6">
          <label class="mb-2 block text-sm font-semibold text-navy">Pilih Layanan</label>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="service in services"
              :key="service.id"
              class="flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 transition-all"
              :class="selectedServiceId === service.id ? 'border-sage bg-[#ecfdf5] shadow-xs' : 'border-[#e2e8f0] hover:border-[#cbd5e1]'"
              @click="selectedServiceId = service.id"
            >
              <div>
                <p class="font-semibold text-navy">{{ service.name }}</p>
                <p class="mt-0.5 text-xs text-[#64748b]">Durasi ~{{ service.durationMinutes }} menit</p>
              </div>
              <div class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border" :class="selectedServiceId === service.id ? 'border-sage bg-sage text-white' : 'border-[#cbd5e1]'">
                <OhVueIcon v-if="selectedServiceId === service.id" name="ri-check-line" class="size-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            type="button"
            :disabled="!selectedDoctorId || !selectedServiceId"
            class="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:opacity-40"
            @click="step = 2"
          >
            Lanjut Pilih Waktu <OhVueIcon name="ri-arrow-right-line" />
          </button>
        </div>
      </div>

      <!-- Step 2: Date & Time Selection -->
      <div v-else-if="step === 2" class="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
        <h2 class="font-display text-xl font-bold text-navy">2. Pilih Tanggal & Jam</h2>
        <p class="mt-1 text-sm text-[#64748b]">Jadwal dokter: <span class="font-semibold text-navy">{{ selectedDoctor?.name }}</span></p>

        <!-- Date picker -->
        <div class="mt-6">
          <label class="mb-1.5 block text-sm font-semibold text-navy" for="booking-date">Pilih Tanggal Konsultasi</label>
          <input
            id="booking-date"
            v-model="selectedDate"
            type="date"
            :min="minDate"
            :max="maxDate"
            class="h-[46px] w-full rounded-xl border border-[#e2e8f0] bg-white px-4 text-base text-navy outline-none transition-colors focus:border-navy"
          >
        </div>

        <!-- Slot picker -->
        <div class="mt-6">
          <label class="mb-2 block text-sm font-semibold text-navy">Slot Jam yang Tersedia</label>

          <div v-if="loadingSlots" class="py-8 text-center text-sm text-[#64748b]">Memeriksa ketersediaan jam...</div>
          <div v-else-if="!slots?.length" class="rounded-xl border border-[#fef3c7] bg-[#fffbeb] p-4 text-center text-sm text-[#92400e]">
            Dokter tidak memiliki jadwal praktik pada tanggal ini. Silakan pilih tanggal lain.
          </div>
          <div v-else class="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            <button
              v-for="slot in slots"
              :key="slot.time"
              type="button"
              :disabled="!slot.available"
              class="flex flex-col items-center justify-center rounded-xl border py-3 text-center transition-all"
              :class="[
                !slot.available
                  ? 'border-[#f1f5f9] bg-[#f8fafc] text-[#cbd5e1] line-through cursor-not-allowed'
                  : selectedTime === slot.time
                  ? 'border-navy bg-navy text-white font-bold shadow-xs'
                  : 'border-[#e2e8f0] bg-white text-navy font-semibold hover:border-navy'
              ]"
              @click="selectedTime = slot.time"
            >
              <span class="text-base">{{ slot.time }}</span>
              <span class="text-[11px] font-normal" :class="selectedTime === slot.time ? 'text-[#cbd5e1]' : 'text-[#94a3b8]'">{{ slot.available ? 'Tersedia' : 'Penuh/Lewat' }}</span>
            </button>
          </div>
        </div>

        <div class="mt-8 flex justify-between">
          <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-5 py-2.5 text-base font-semibold text-[#475569] hover:bg-[#f8fafc]" @click="step = 1">
            <OhVueIcon name="ri-arrow-left-line" /> Kembali
          </button>
          <button
            type="button"
            :disabled="!selectedTime"
            class="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:opacity-40"
            @click="step = 3"
          >
            Lanjut Isi Identitas <OhVueIcon name="ri-arrow-right-line" />
          </button>
        </div>
      </div>

      <!-- Step 3: Patient Form & Confirmation -->
      <div v-else-if="step === 3" class="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
        <h2 class="font-display text-xl font-bold text-navy">3. Identitas Pasien</h2>
        <p class="mt-1 text-sm text-[#64748b]">Isi data kontak untuk menerima rincian dan konfirmasi reservasi.</p>

        <!-- Summary box -->
        <div class="mt-5 rounded-xl bg-[#ecfdf5] p-4 text-sm text-sage-dark border border-[#a7f3d0]">
          <p class="font-bold text-navy">{{ selectedDoctor?.name }} — {{ selectedService?.name }}</p>
          <p class="mt-1">Tanggal: <span class="font-semibold">{{ selectedDate }}</span> | Jam: <span class="font-semibold">{{ selectedTime }} WIB</span></p>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="submitBooking">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-navy" for="patient-name">Nama Lengkap Pasien *</label>
            <input id="patient-name" v-model="patientName" required minlength="2" maxlength="100" class="h-[46px] w-full rounded-xl border border-[#e2e8f0] bg-white px-4 text-base text-navy outline-none focus:border-navy" placeholder="Contoh: Ahmad Rizki">
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-navy" for="patient-phone">Nomor WhatsApp *</label>
            <input id="patient-phone" v-model="patientPhone" type="tel" required pattern="^(\+62|62|0)8[1-9][0-9]{7,11}$" class="h-[46px] w-full rounded-xl border border-[#e2e8f0] bg-white px-4 text-base text-navy outline-none focus:border-navy" placeholder="Contoh: 081234567890">
            <p class="mt-1 text-xs text-[#94a3b8]">Nomor ini digunakan untuk konfirmasi status reservasi.</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-navy" for="patient-email">Email (Opsional)</label>
            <input id="patient-email" v-model="patientEmail" type="email" class="h-[46px] w-full rounded-xl border border-[#e2e8f0] bg-white px-4 text-base text-navy outline-none focus:border-navy" placeholder="email@pasien.com">
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-navy" for="patient-note">Catatan Keluhan Singkat (Opsional)</label>
            <textarea id="patient-note" v-model="note" rows="3" maxlength="500" class="w-full rounded-xl border border-[#e2e8f0] bg-white p-3.5 text-base text-navy outline-none focus:border-navy" placeholder="Tuliskan keluhan atau hal khusus yang perlu diketahui dokter..."></textarea>
          </div>

          <p v-if="bookingError" class="rounded-xl bg-[#fef2f2] p-3.5 text-sm text-[#b91c1c]" role="alert">{{ bookingError }}</p>

          <div class="mt-8 flex justify-between pt-2">
            <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-5 py-2.5 text-base font-semibold text-[#475569] hover:bg-[#f8fafc]" @click="step = 2">
              <OhVueIcon name="ri-arrow-left-line" /> Kembali
            </button>
            <button
              type="submit"
              :disabled="submitting || !patientName || !patientPhone"
              class="inline-flex items-center gap-2 rounded-xl bg-sage px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-sage-dark disabled:opacity-40"
            >
              {{ submitting ? 'Memproses Reservasi...' : 'Konfirmasi & Kirim Reservasi' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
