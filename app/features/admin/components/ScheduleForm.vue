<script setup lang="ts">
import type { DoctorOption, SchedulePayload, ScheduleRow } from '~~/shared/types/admin'

const props = defineProps<{
  schedule?: ScheduleRow | null
  doctors: DoctorOption[]
  submitting: boolean
}>()

const emit = defineEmits<{
  save: [payload: SchedulePayload]
  cancel: []
}>()

const days = [
  { value: 0, label: 'Minggu' },
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' }
]

const form = reactive({
  doctorId: props.schedule?.doctorId ?? props.doctors[0]?.id ?? '',
  dayOfWeek: props.schedule?.dayOfWeek ?? 1,
  startTime: props.schedule?.startTime ?? '08:00',
  endTime: props.schedule?.endTime ?? '12:00',
  isActive: props.schedule?.isActive ?? true
})

function submit() {
  emit('save', {
    doctorId: form.doctorId,
    dayOfWeek: Number(form.dayOfWeek),
    startTime: form.startTime,
    endTime: form.endTime,
    isActive: form.isActive
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="schedule-doctor">Dokter</label>
      <select id="schedule-doctor" v-model="form.doctorId" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
        <option value="" disabled>Pilih dokter</option>
        <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">{{ doctor.name }}</option>
      </select>
      <p v-if="!doctors.length" class="mt-1.5 text-sm text-[#dc2626]">Tambahkan dokter terlebih dahulu.</p>
    </div>
    <div class="grid gap-4 sm:grid-cols-3">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="schedule-day">Hari</label>
        <select id="schedule-day" v-model.number="form.dayOfWeek" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
          <option v-for="day in days" :key="day.value" :value="day.value">{{ day.label }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="schedule-start">Mulai</label>
        <input id="schedule-start" v-model="form.startTime" type="time" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="schedule-end">Selesai</label>
        <input id="schedule-end" v-model="form.endTime" type="time" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
      </div>
    </div>
    <label class="flex items-center gap-2 text-base text-[#475569]"><input v-model="form.isActive" type="checkbox" class="size-[18px] rounded border-[#cbd5e1] accent-navy"> Jadwal aktif</label>
    <div class="flex justify-end gap-3 pt-2">
      <button type="button" class="rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-base font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]" @click="emit('cancel')">Batal</button>
      <button type="submit" :disabled="submitting || !doctors.length" class="rounded-lg bg-navy px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-40">{{ submitting ? 'Menyimpan...' : 'Simpan jadwal' }}</button>
    </div>
  </form>
</template>
