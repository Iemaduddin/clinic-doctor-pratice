<script setup lang="ts">
import type { DoctorPayload, DoctorRow, SpecializationOption } from '~~/shared/types/admin'

const props = defineProps<{
  doctor?: DoctorRow | null
  specializations: SpecializationOption[]
  submitting: boolean
}>()

const emit = defineEmits<{
  save: [payload: DoctorPayload]
  cancel: []
}>()

const form = reactive({
  name: props.doctor?.name ?? '',
  specializationId: props.doctor?.specializationId ?? props.specializations[0]?.id ?? '',
  bio: props.doctor?.bio ?? '',
  photoUrl: props.doctor?.photoUrl ?? '',
  slotDurationMinutes: props.doctor?.slotDurationMinutes ?? 30,
  isActive: props.doctor?.isActive ?? true
})

function submit() {
  emit('save', {
    name: form.name,
    specializationId: form.specializationId,
    bio: form.bio || null,
    photoUrl: form.photoUrl || null,
    slotDurationMinutes: form.slotDurationMinutes,
    isActive: form.isActive
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="doctor-name">Nama dokter</label>
      <input id="doctor-name" v-model="form.name" required minlength="2" maxlength="120" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="dr. Nama Lengkap, Sp.X">
    </div>
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="doctor-specialization">Spesialisasi</label>
      <select id="doctor-specialization" v-model="form.specializationId" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
        <option value="" disabled>Pilih spesialisasi</option>
        <option v-for="item in specializations" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <p v-if="!specializations.length" class="mt-1.5 text-sm text-[#dc2626]">Tambahkan spesialisasi terlebih dahulu.</p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="doctor-slot">Durasi slot (menit)</label>
        <input id="doctor-slot" v-model.number="form.slotDurationMinutes" type="number" min="5" max="240" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
      </div>
      <div class="flex items-end pb-2.5">
        <label class="flex items-center gap-2 text-base text-[#475569]"><input v-model="form.isActive" type="checkbox" class="size-[18px] rounded border-[#cbd5e1] accent-navy"> Aktif menerima reservasi</label>
      </div>
    </div>
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="doctor-photo">URL foto</label>
      <input id="doctor-photo" v-model="form.photoUrl" type="url" maxlength="500" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="https://...">
    </div>
    <div>
      <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="doctor-bio">Bio</label>
      <textarea id="doctor-bio" v-model="form.bio" maxlength="2000" rows="4" class="w-full rounded-lg border border-[#e2e8f0] px-3.5 py-3 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Ringkasan pengalaman dan fokus layanan."></textarea>
    </div>
    <div class="flex justify-end gap-3 pt-2">
      <button type="button" class="rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-base font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]" @click="emit('cancel')">Batal</button>
      <button type="submit" :disabled="submitting || !specializations.length" class="rounded-lg bg-navy px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-40">{{ submitting ? 'Menyimpan...' : 'Simpan dokter' }}</button>
    </div>
  </form>
</template>
