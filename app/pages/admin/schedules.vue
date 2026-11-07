<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiTimeLine } from 'oh-vue-icons/icons/ri'
import type { DoctorOption, Paginated, SchedulePayload, ScheduleRow } from '~~/shared/types/admin'

addIcons(RiAddLine, RiDeleteBinLine, RiEditLine, RiTimeLine)

definePageMeta({ layout: 'admin', middleware: 'admin' })

const page = ref(1)
const pageSize = ref(10)
watch(pageSize, () => { page.value = 1 })
const { data, refresh, pending } = await useFetch<Paginated<ScheduleRow>>('/api/admin/schedules', {
  query: { page, pageSize },
  watch: [page, pageSize]
})
const schedules = computed(() => data.value?.items ?? [])
const { data: allSchedules, refresh: refreshAllSchedules } = await useFetch<ScheduleRow[]>('/api/admin/schedules', { query: { all: 1 } })
const { data: doctors } = await useFetch<DoctorOption[]>('/api/admin/doctors', { query: { all: 1 } })

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'short' }).format(new Date())
const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday)
const view = ref<'matrix' | 'list' | 'exceptions'>('matrix')
const jakartaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const exceptionDate = ref(jakartaDate)
const { data: exceptions, refresh: refreshExceptions, pending: exceptionsPending } = await useFetch<any[]>('/api/admin/schedule-exceptions', { query: { date: exceptionDate }, watch: [exceptionDate] })
const exceptionDoctorId = ref('')
const exceptionKind = ref<'CLOSED' | 'OPEN'>('CLOSED')
const exceptionWholeDay = ref(true)
const exceptionStart = ref('')
const exceptionEnd = ref('')
const exceptionReason = ref('')
const exceptionError = ref('')
const exceptionSubmitting = ref(false)
const exceptionDeleteTarget = ref<any>(null)
const exceptionDeleting = ref(false)
const initialDoctorId = ref('')
const initialDayOfWeek = ref<number>()
function cellSchedules(doctorId: string, day: number) {
  return (allSchedules.value ?? []).filter(item => item.doctorId === doctorId && item.dayOfWeek === day)
}
function addSchedule(doctorId: string, day: number) {
  editing.value = null
  initialDoctorId.value = doctorId
  initialDayOfWeek.value = day
  formError.value = ''
  showForm.value = true
}

const showForm = ref(false)
const editing = ref<ScheduleRow | null>(null)
const submitting = ref(false)
const formError = ref('')
const pageError = ref('')
const notice = ref('')
const deleteTarget = ref<ScheduleRow | null>(null)
const deleting = ref(false)

async function saveException() {
  exceptionSubmitting.value = true
  exceptionError.value = ''
  try {
    await $fetch('/api/admin/schedule-exceptions', { method: 'POST', body: { doctorId: exceptionDoctorId.value, date: exceptionDate.value, kind: exceptionKind.value, startTime: exceptionKind.value === 'OPEN' || !exceptionWholeDay.value ? exceptionStart.value : null, endTime: exceptionKind.value === 'OPEN' || !exceptionWholeDay.value ? exceptionEnd.value : null, reason: exceptionReason.value || null } })
    notice.value = 'Pengecualian ditambahkan.'
    exceptionStart.value = ''
    exceptionEnd.value = ''
    exceptionReason.value = ''
    await refreshExceptions()
  } catch (error) {
    exceptionError.value = apiErrorMessage(error, 'Gagal menyimpan pengecualian.')
  } finally {
    exceptionSubmitting.value = false
  }
}

async function deleteException() {
  if (!exceptionDeleteTarget.value) return
  exceptionDeleting.value = true
  exceptionError.value = ''
  try {
    await $fetch('/api/admin/schedule-exceptions', { method: 'DELETE', body: { id: exceptionDeleteTarget.value.id } })
    exceptionDeleteTarget.value = null
    notice.value = 'Pengecualian dihapus.'
    await refreshExceptions()
  } catch (error) {
    exceptionError.value = apiErrorMessage(error, 'Gagal menghapus pengecualian.')
  } finally {
    exceptionDeleting.value = false
  }
}

function openCreate() {
  editing.value = null
  initialDoctorId.value = ''
  initialDayOfWeek.value = undefined
  formError.value = ''
  showForm.value = true
}

function openEdit(schedule: ScheduleRow) {
  editing.value = schedule
  initialDoctorId.value = ''
  initialDayOfWeek.value = undefined
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

    await Promise.all([refresh(), refreshAllSchedules()])
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
    await Promise.all([refresh(), refreshAllSchedules()])
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

    <div class="mb-4 flex flex-wrap gap-3">
      <button type="button" :aria-pressed="view === 'matrix'" class="rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-navy aria-pressed:bg-navy aria-pressed:text-white" @click="view = 'matrix'">Matriks mingguan</button>
      <button type="button" :aria-pressed="view === 'list'" class="rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-navy aria-pressed:bg-navy aria-pressed:text-white" @click="view = 'list'">Daftar</button>
      <button type="button" :aria-pressed="view === 'exceptions'" class="rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-navy aria-pressed:bg-navy aria-pressed:text-white" @click="view = 'exceptions'">Pengecualian tanggal</button>
      <select v-if="view === 'list'" v-model.number="pageSize" aria-label="Jumlah baris per halaman" class="h-[42px] rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none focus:border-navy">
        <option :value="10">10 per halaman</option><option :value="25">25 per halaman</option><option :value="50">50 per halaman</option>
      </select>
    </div>

    <div v-if="!doctors?.length" class="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">Tambahkan dokter terlebih dahulu di <NuxtLink to="/admin/doctors" class="font-semibold underline">halaman dokter</NuxtLink>.</div>

    <section v-if="view === 'exceptions'" class="space-y-5">
      <form class="grid gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 md:grid-cols-2" @submit.prevent="saveException">
        <p v-if="exceptionError" class="md:col-span-2 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ exceptionError }}</p>
        <label class="grid gap-1 text-sm font-semibold text-navy">Tanggal<input v-model="exceptionDate" type="date" required class="h-11 rounded-lg border border-[#cbd5e1] px-3 font-normal"></label>
        <label class="grid gap-1 text-sm font-semibold text-navy">Dokter<select v-model="exceptionDoctorId" required class="h-11 rounded-lg border border-[#cbd5e1] bg-white px-3 font-normal"><option value="" disabled>Pilih dokter</option><option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">{{ doctor.name }}</option></select></label>
        <label class="grid gap-1 text-sm font-semibold text-navy">Jenis<select v-model="exceptionKind" class="h-11 rounded-lg border border-[#cbd5e1] bg-white px-3 font-normal"><option value="CLOSED">CLOSED — Tutup</option><option value="OPEN">OPEN — Buka tambahan</option></select></label>
        <label v-if="exceptionKind === 'CLOSED'" class="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-navy"><input v-model="exceptionWholeDay" type="checkbox" class="size-4">Tutup sepanjang hari</label>
        <template v-if="exceptionKind === 'OPEN' || !exceptionWholeDay">
          <label class="grid gap-1 text-sm font-semibold text-navy">Jam mulai<input v-model="exceptionStart" type="time" required class="h-11 rounded-lg border border-[#cbd5e1] px-3 font-normal"></label>
          <label class="grid gap-1 text-sm font-semibold text-navy">Jam selesai<input v-model="exceptionEnd" type="time" required class="h-11 rounded-lg border border-[#cbd5e1] px-3 font-normal"></label>
        </template>
        <label class="grid gap-1 text-sm font-semibold text-navy md:col-span-2">Alasan (opsional)<input v-model="exceptionReason" maxlength="500" class="h-11 rounded-lg border border-[#cbd5e1] px-3 font-normal"></label>
        <button type="submit" :disabled="exceptionSubmitting || !doctors?.length" class="w-fit rounded-lg bg-navy px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">{{ exceptionSubmitting ? 'Menyimpan…' : 'Tambah pengecualian' }}</button>
      </form>
      <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
        <p v-if="exceptionsPending" class="p-6 text-center text-[#64748b]">Memuat pengecualian…</p>
        <p v-else-if="!exceptions?.length" class="p-6 text-center text-[#64748b]">Tidak ada pengecualian tanggal ini.</p>
        <div v-else class="divide-y divide-[#e2e8f0]">
          <div v-for="item in exceptions" :key="item.id" class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div><p class="font-semibold text-navy">{{ item.doctor.name }} · {{ item.kind === 'OPEN' ? 'Buka tambahan' : 'Tutup' }}</p><p class="text-sm text-[#64748b]">{{ item.startTime && item.endTime ? `${item.startTime}–${item.endTime}` : 'Sepanjang hari' }}<span v-if="item.reason"> · {{ item.reason }}</span></p></div>
            <button type="button" class="rounded-lg px-3 py-2 text-sm font-semibold text-[#b91c1c] hover:bg-[#fef2f2]" @click="exceptionDeleteTarget = item">Hapus</button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="view === 'matrix'" class="overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-white">
      <div v-if="pending" class="p-8 text-center text-base text-[#64748b]">Memuat jadwal...</div>
      <table v-else class="w-full min-w-[1000px] text-left">
        <thead><tr class="bg-[#f8fafc] text-sm text-[#64748b]"><th class="sticky left-0 bg-[#f8fafc] px-4 py-3">Dokter</th><th v-for="(day, index) in days" :key="day" class="px-3 py-3" :class="index === today ? 'bg-[#ecfdf5] text-sage-dark' : ''">{{ day }}<span v-if="index === today" class="block text-xs">Hari ini</span></th></tr></thead>
        <tbody class="divide-y divide-[#e2e8f0]"><tr v-for="doctor in doctors" :key="doctor.id"><th class="sticky left-0 bg-white px-4 py-3 text-sm font-semibold text-navy">{{ doctor.name }}</th><td v-for="(day, index) in days" :key="day" class="min-w-[115px] px-3 py-3 align-top" :class="index === today ? 'bg-[#f0fdf4]' : ''"><div class="space-y-2"><div v-for="item in cellSchedules(doctor.id, index)" :key="item.id" class="rounded-lg border border-[#e2e8f0] p-2 text-xs"><button type="button" class="font-semibold text-navy underline" @click="openEdit(item)">{{ item.startTime }}–{{ item.endTime }}</button><span class="ml-1" :class="item.isActive ? 'text-sage-dark' : 'text-[#64748b]'">{{ item.isActive ? 'Aktif' : 'Nonaktif' }}</span></div><button type="button" class="w-full rounded-md border border-dashed border-[#cbd5e1] px-2 py-1.5 text-xs font-semibold text-[#475569] hover:bg-white" :aria-label="`Tambah jadwal ${doctor.name}, ${day}`" @click="addSchedule(doctor.id, index)">+ Tambah</button></div></td></tr></tbody>
      </table>
    </div>

    <div v-if="view === 'list'" class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
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
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] px-5 py-4 text-sm text-[#64748b]">
        <span>Menampilkan {{ data?.total ? ((page - 1) * pageSize + 1) : 0 }}–{{ Math.min(page * pageSize, data?.total ?? 0) }} dari {{ data?.total ?? 0 }} jadwal</span>
        <div class="flex items-center gap-2"><button type="button" :disabled="page <= 1 || pending" class="rounded-lg border border-[#e2e8f0] px-3 py-2 font-medium text-navy disabled:opacity-40" @click="page--">Sebelumnya</button><span>Halaman {{ page }} dari {{ data?.totalPages ?? 1 }}</span><button type="button" :disabled="page >= (data?.totalPages ?? 1) || pending" class="rounded-lg border border-[#e2e8f0] px-3 py-2 font-medium text-navy disabled:opacity-40" @click="page++">Berikutnya</button></div>
      </div>
    </div>

    <AdminModal v-if="showForm" :title="editing ? 'Edit jadwal' : 'Tambah jadwal'" @close="closeForm">
      <p v-if="formError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ formError }}</p>
      <ScheduleForm :key="`${editing?.id ?? 'new'}-${initialDoctorId}-${initialDayOfWeek}`" :schedule="editing" :doctors="doctors ?? []" :initial-doctor-id="initialDoctorId" :initial-day-of-week="initialDayOfWeek" :submitting="submitting" @save="saveSchedule" @cancel="closeForm" />
    </AdminModal>
    <AdminConfirmDialog
      v-if="exceptionDeleteTarget"
      title="Hapus pengecualian?"
      :description="`Pengecualian ${exceptionDeleteTarget.doctor.name} tanggal ${exceptionDate} akan dihapus.`"
      :submitting="exceptionDeleting"
      @confirm="deleteException"
      @cancel="exceptionDeleteTarget = null"
    />
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
