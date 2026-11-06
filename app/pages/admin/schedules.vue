<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiTimeLine } from 'oh-vue-icons/icons/ri'
import type { DoctorOption, SchedulePayload, ScheduleRow } from '~~/shared/types/admin'

addIcons(RiAddLine, RiDeleteBinLine, RiEditLine, RiTimeLine)

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: schedules, refresh, pending } = await useFetch<ScheduleRow[]>('/api/admin/schedules')
const { data: doctors } = await useFetch<DoctorOption[]>('/api/admin/doctors')

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const showForm = ref(false)
const editing = ref<ScheduleRow | null>(null)
const submitting = ref(false)
const formError = ref('')
const pageError = ref('')
const notice = ref('')
const deleteTarget = ref<ScheduleRow | null>(null)
const deleting = ref(false)

function openCreate() {
  editing.value = null
  formError.value = ''
  showForm.value = true
}

function openEdit(schedule: ScheduleRow) {
  editing.value = schedule
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editing.value = null
  formError.value = ''
}

async function saveSchedule(payload: SchedulePayload) {
  submitting.value = true
  formError.value = ''

  try {
    if (editing.value) {
      await $fetch(`/api/admin/schedules/${editing.value.id}`, { method: 'PATCH', body: payload })
      notice.value = 'Jadwal diperbarui.'
    } else {
      await $fetch('/api/admin/schedules', { method: 'POST', body: payload })
      notice.value = 'Jadwal baru ditambahkan.'
    }

    await refresh()
    closeForm()
  } catch (error) {
    formError.value = apiErrorMessage(error, 'Gagal menyimpan jadwal.')
  } finally {
    submitting.value = false
  }
}

async function deleteSchedule() {
  if (!deleteTarget.value) return
  deleting.value = true
  pageError.value = ''

  try {
    await $fetch(`/api/admin/schedules/${deleteTarget.value.id}`, { method: 'DELETE' })
    notice.value = 'Jadwal dihapus.'
    await refresh()
    deleteTarget.value = null
  } catch (error) {
    pageError.value = apiErrorMessage(error, 'Gagal menghapus jadwal.')
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'Kelola Jadwal | Klinik Sehat' })
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Manajemen</p>
        <h1 class="font-display text-3xl font-bold text-navy">Jadwal Praktik</h1>
        <p class="mt-2 text-base text-[#64748b]">Atur jam praktik dokter setiap pekan.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:opacity-40" :disabled="!doctors?.length" @click="openCreate"><OhVueIcon name="ri-add-line" /> Tambah jadwal</button>
    </div>

    <p v-if="pageError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ pageError }}</p>
    <p v-if="notice" class="mb-4 rounded-lg bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ notice }}</p>

    <div v-if="!doctors?.length" class="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">Tambahkan dokter terlebih dahulu di <NuxtLink to="/admin/doctors" class="font-semibold underline">halaman dokter</NuxtLink>.</div>

    <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <div v-if="pending" class="p-8 text-center text-base text-[#64748b]">Memuat jadwal...</div>
      <div v-else-if="!schedules?.length" class="p-10 text-center">
        <OhVueIcon name="ri-time-line" class="mx-auto mb-3 size-10 text-[#cbd5e1]" />
        <p class="text-base font-semibold text-navy">Belum ada jadwal</p>
        <p class="mt-1 text-sm text-[#64748b]">Tambahkan sesi praktik untuk dokter yang aktif.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[620px] text-left">
          <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
            <tr><th class="px-5 py-3 font-semibold">Dokter</th><th class="px-5 py-3 font-semibold">Hari</th><th class="px-5 py-3 font-semibold">Jam</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr>
          </thead>
          <tbody class="divide-y divide-[#e2e8f0]">
            <tr v-for="schedule in schedules" :key="schedule.id">
              <td class="px-5 py-4 font-semibold text-navy">{{ schedule.doctor.name }}</td>
              <td class="px-5 py-4 text-base text-[#475569]">{{ days[schedule.dayOfWeek] }}</td>
              <td class="px-5 py-4 text-base text-[#475569]">{{ schedule.startTime }}–{{ schedule.endTime }}</td>
              <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-sm font-medium" :class="schedule.isActive ? 'bg-[#ecfdf5] text-sage-dark' : 'bg-[#f1f5f9] text-[#64748b]'">{{ schedule.isActive ? 'Aktif' : 'Nonaktif' }}</span></td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button type="button" class="grid size-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9]" aria-label="Edit jadwal" @click="openEdit(schedule)"><OhVueIcon name="ri-edit-line" /></button>
                  <button type="button" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2]" aria-label="Hapus jadwal" @click="deleteTarget = schedule"><OhVueIcon name="ri-delete-bin-line" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminModal v-if="showForm" :title="editing ? 'Edit jadwal' : 'Tambah jadwal'" @close="closeForm">
      <p v-if="formError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ formError }}</p>
      <ScheduleForm :key="editing?.id ?? 'new'" :schedule="editing" :doctors="doctors ?? []" :submitting="submitting" @save="saveSchedule" @cancel="closeForm" />
    </AdminModal>
    <AdminConfirmDialog
      v-if="deleteTarget"
      title="Hapus jadwal?"
      :description="`Jadwal ${deleteTarget.doctor.name} hari ${days[deleteTarget.dayOfWeek]} pukul ${deleteTarget.startTime} akan dihapus.`"
      :submitting="deleting"
      @confirm="deleteSchedule"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
