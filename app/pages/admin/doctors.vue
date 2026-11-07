<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine, RiCloseLine, RiDeleteBinLine, RiEditLine, RiStethoscopeLine } from 'oh-vue-icons/icons/ri'
import type { DoctorPayload, DoctorRow, Paginated, SpecializationOption } from '~~/shared/types/admin'

addIcons(RiAddLine, RiCloseLine, RiDeleteBinLine, RiEditLine, RiStethoscopeLine)

definePageMeta({ layout: 'admin', middleware: 'admin' })

const search = ref('')
const debouncedSearch = ref('')
const page = ref(1)
const pageSize = ref(10)
let searchTimer: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value
    page.value = 1
  }, 300)
})
watch(pageSize, () => { page.value = 1 })

const { data, refresh: refreshDoctors, pending } = await useFetch<Paginated<DoctorRow>>('/api/admin/doctors', {
  query: { page, pageSize, search: debouncedSearch },
  watch: [page, pageSize, debouncedSearch]
})
const doctors = computed(() => data.value?.items ?? [])
const { data: specializations, refresh: refreshSpecializations } = await useFetch<SpecializationOption[]>('/api/admin/specializations')

const showForm = ref(false)
const editing = ref<DoctorRow | null>(null)
const submitting = ref(false)
const formError = ref('')
const pageError = ref('')
const notice = ref('')
const newSpecialization = ref('')
const addingSpecialization = ref(false)
const editingSpecialization = ref<SpecializationOption | null>(null)
const specializationName = ref('')
const savingSpecialization = ref(false)
const specializationError = ref('')
const deleteTarget = ref<{ type: 'doctor' | 'specialization'; id: string; name: string } | null>(null)
const deleting = ref(false)

function openCreate() {
  editing.value = null
  formError.value = ''
  showForm.value = true
}

function openEdit(doctor: DoctorRow) {
  editing.value = doctor
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editing.value = null
  formError.value = ''
}

async function saveDoctor(payload: DoctorPayload) {
  submitting.value = true
  formError.value = ''

  try {
    if (editing.value) {
      await $fetch(`/api/admin/doctors/${editing.value.id}`, { method: 'PATCH', body: payload })
      notice.value = 'Data dokter diperbarui.'
    } else {
      await $fetch('/api/admin/doctors', { method: 'POST', body: payload })
      notice.value = 'Dokter baru ditambahkan.'
    }

    await refreshDoctors()
    closeForm()
  } catch (error) {
    formError.value = apiErrorMessage(error, 'Gagal menyimpan dokter.')
  } finally {
    submitting.value = false
  }
}

function confirmDeleteDoctor(doctor: DoctorRow) {
  deleteTarget.value = { type: 'doctor', id: doctor.id, name: doctor.name }
}

function confirmDeleteSpecialization(item: SpecializationOption) {
  deleteTarget.value = { type: 'specialization', id: item.id, name: item.name }
}

async function deleteRecord() {
  if (!deleteTarget.value) return
  const target = deleteTarget.value
  deleting.value = true
  pageError.value = ''

  try {
    await $fetch(`/api/admin/${target.type === 'doctor' ? 'doctors' : 'specializations'}/${target.id}`, { method: 'DELETE' })
    notice.value = target.type === 'doctor' ? 'Dokter dihapus.' : 'Spesialisasi dihapus.'
    await Promise.all([refreshDoctors(), refreshSpecializations()])
    deleteTarget.value = null
  } catch (error) {
    pageError.value = apiErrorMessage(error, target.type === 'doctor' ? 'Gagal menghapus dokter.' : 'Gagal menghapus spesialisasi.')
  } finally {
    deleting.value = false
  }
}

function openEditSpecialization(item: SpecializationOption) {
  editingSpecialization.value = item
  specializationName.value = item.name
  specializationError.value = ''
}

async function saveSpecialization() {
  if (!editingSpecialization.value || !specializationName.value.trim()) return
  savingSpecialization.value = true
  specializationError.value = ''

  try {
    await $fetch(`/api/admin/specializations/${editingSpecialization.value.id}`, {
      method: 'PATCH',
      body: { name: specializationName.value }
    })
    notice.value = 'Spesialisasi diperbarui.'
    editingSpecialization.value = null
    await refreshSpecializations()
  } catch (error) {
    specializationError.value = apiErrorMessage(error, 'Gagal memperbarui spesialisasi.')
  } finally {
    savingSpecialization.value = false
  }
}

async function addSpecialization() {
  if (!newSpecialization.value.trim()) return
  addingSpecialization.value = true
  pageError.value = ''

  try {
    await $fetch('/api/admin/specializations', { method: 'POST', body: { name: newSpecialization.value } })
    newSpecialization.value = ''
    notice.value = 'Spesialisasi ditambahkan.'
    await refreshSpecializations()
  } catch (error) {
    pageError.value = apiErrorMessage(error, 'Gagal menambah spesialisasi.')
  } finally {
    addingSpecialization.value = false
  }
}

useHead({ title: 'Kelola Dokter | Klinik Sehat' })
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Manajemen</p>
        <h1 class="font-display text-3xl font-bold text-navy">Dokter</h1>
        <p class="mt-2 text-base text-[#64748b]">Kelola profil dokter dan spesialisasinya.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617]" @click="openCreate"><OhVueIcon name="ri-add-line" /> Tambah dokter</button>
    </div>

    <p v-if="pageError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ pageError }}</p>
    <p v-if="notice" class="mb-4 rounded-lg bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ notice }}</p>

    <div class="mb-4 flex flex-wrap gap-3">
      <input v-model="search" type="search" placeholder="Cari nama dokter..." aria-label="Cari dokter" class="h-[42px] min-w-60 flex-1 rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none focus:border-navy">
      <select v-model.number="pageSize" aria-label="Jumlah baris per halaman" class="h-[42px] rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none focus:border-navy">
        <option :value="10">10 per halaman</option><option :value="25">25 per halaman</option><option :value="50">50 per halaman</option>
      </select>
    </div>

    <section class="mb-6 rounded-2xl border border-[#e2e8f0] bg-white p-5">
      <h2 class="font-display text-lg font-semibold text-navy">Spesialisasi</h2>
      <p class="mt-1 text-sm text-[#64748b]">Dibutuhkan sebelum menambah dokter.</p>
      <form class="mt-3 flex flex-wrap gap-2" @submit.prevent="addSpecialization">
        <input v-model="newSpecialization" maxlength="100" class="h-[42px] min-w-56 flex-1 rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Nama spesialisasi baru" aria-label="Nama spesialisasi baru">
        <button type="submit" :disabled="addingSpecialization || !newSpecialization.trim()" class="rounded-lg border border-[#cbd5e1] px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-[#f8fafc] disabled:opacity-40">{{ addingSpecialization ? 'Menambah...' : 'Tambah' }}</button>
      </form>
      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="item in specializations" :key="item.id" class="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] py-1.5 pl-3 pr-2 text-sm text-[#475569]">{{ item.name }}<span class="text-xs text-[#94a3b8]">{{ item._count?.doctors ?? 0 }}</span><button type="button" class="grid size-5 place-items-center rounded-full text-[#64748b] transition-colors hover:bg-[#e2e8f0] hover:text-navy" :aria-label="`Edit spesialisasi ${item.name}`" @click="openEditSpecialization(item)"><OhVueIcon name="ri-edit-line" class="size-3.5" /></button><button type="button" class="grid size-5 place-items-center rounded-full text-[#94a3b8] transition-colors hover:bg-[#e2e8f0] hover:text-[#b91c1c]" :aria-label="`Hapus spesialisasi ${item.name}`" @click="confirmDeleteSpecialization(item)"><OhVueIcon name="ri-close-line" class="size-3.5" /></button></span>
        <span v-if="!specializations?.length" class="text-sm text-[#94a3b8]">Belum ada spesialisasi.</span>
      </div>
    </section>

    <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <div v-if="pending" class="p-8 text-center text-base text-[#64748b]">Memuat data dokter...</div>
      <div v-else-if="!doctors?.length" class="p-10 text-center">
        <OhVueIcon name="ri-stethoscope-line" class="mx-auto mb-3 size-10 text-[#cbd5e1]" />
        <p class="text-base font-semibold text-navy">Belum ada dokter</p>
        <p class="mt-1 text-sm text-[#64748b]">Tambahkan dokter pertama untuk mulai menyusun jadwal.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[700px] text-left">
          <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
            <tr><th class="px-5 py-3 font-semibold">Dokter</th><th class="px-5 py-3 font-semibold">Spesialisasi</th><th class="px-5 py-3 font-semibold">Slot</th><th class="px-5 py-3 font-semibold">Jadwal</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr>
          </thead>
          <tbody class="divide-y divide-[#e2e8f0]">
            <tr v-for="doctor in doctors" :key="doctor.id" class="align-middle">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img v-if="doctor.photoUrl" :src="doctor.photoUrl" :alt="doctor.name" class="size-10 rounded-full object-cover">
                  <span v-else class="grid size-10 place-items-center rounded-full bg-[#ecfdf5] text-sage-dark"><OhVueIcon name="ri-stethoscope-line" /></span>
                  <div><p class="font-semibold text-navy">{{ doctor.name }}</p><p class="max-w-xs truncate text-sm text-[#94a3b8]">{{ doctor.bio || 'Belum ada bio' }}</p></div>
                </div>
              </td>
              <td class="px-5 py-4 text-base text-[#475569]">{{ doctor.specialization.name }}</td>
              <td class="px-5 py-4 text-base text-[#475569]">{{ doctor.slotDurationMinutes }} menit</td>
              <td class="px-5 py-4 text-base text-[#475569]">{{ doctor.schedules.length }} sesi</td>
              <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-sm font-medium" :class="doctor.isActive ? 'bg-[#ecfdf5] text-sage-dark' : 'bg-[#f1f5f9] text-[#64748b]'">{{ doctor.isActive ? 'Aktif' : 'Nonaktif' }}</span></td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button type="button" class="grid size-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9]" aria-label="Edit dokter" @click="openEdit(doctor)"><OhVueIcon name="ri-edit-line" /></button>
                  <button type="button" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2]" aria-label="Hapus dokter" @click="confirmDeleteDoctor(doctor)"><OhVueIcon name="ri-delete-bin-line" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] px-5 py-4 text-sm text-[#64748b]">
        <span>Menampilkan {{ data?.total ? ((page - 1) * pageSize + 1) : 0 }}–{{ Math.min(page * pageSize, data?.total ?? 0) }} dari {{ data?.total ?? 0 }} dokter</span>
        <div class="flex items-center gap-2"><button type="button" :disabled="page <= 1 || pending" class="rounded-lg border border-[#e2e8f0] px-3 py-2 font-medium text-navy disabled:opacity-40" @click="page--">Sebelumnya</button><span>Halaman {{ page }} dari {{ data?.totalPages ?? 1 }}</span><button type="button" :disabled="page >= (data?.totalPages ?? 1) || pending" class="rounded-lg border border-[#e2e8f0] px-3 py-2 font-medium text-navy disabled:opacity-40" @click="page++">Berikutnya</button></div>
      </div>
    </div>

    <AdminModal v-if="showForm" :title="editing ? 'Edit dokter' : 'Tambah dokter'" @close="closeForm">
      <p v-if="formError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ formError }}</p>
      <DoctorForm :key="editing?.id ?? 'new'" :doctor="editing" :specializations="specializations ?? []" :submitting="submitting" @save="saveDoctor" @cancel="closeForm" />
    </AdminModal>
    <AdminModal v-if="editingSpecialization" title="Edit spesialisasi" @close="editingSpecialization = null">
      <form class="space-y-4" @submit.prevent="saveSpecialization">
        <div>
          <label for="specialization-edit-name" class="mb-1.5 block text-sm font-medium text-navy">Nama spesialisasi</label>
          <input id="specialization-edit-name" v-model="specializationName" required minlength="2" maxlength="100" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none focus:border-navy">
        </div>
        <p v-if="specializationError" class="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ specializationError }}</p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-base font-semibold text-[#475569]" @click="editingSpecialization = null">Batal</button>
          <button type="submit" :disabled="savingSpecialization" class="rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white disabled:opacity-50">{{ savingSpecialization ? 'Menyimpan...' : 'Simpan' }}</button>
        </div>
      </form>
    </AdminModal>
    <AdminConfirmDialog
      v-if="deleteTarget"
      :title="deleteTarget.type === 'doctor' ? 'Hapus dokter?' : 'Hapus spesialisasi?'"
      :description="`Data ${deleteTarget.name} akan dihapus. Tindakan ini tidak dapat dibatalkan.`"
      :submitting="deleting"
      @confirm="deleteRecord"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
