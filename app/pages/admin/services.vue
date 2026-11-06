<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiHeartPulseLine } from 'oh-vue-icons/icons/ri'
import type { MedicalServiceRow, ServicePayload } from '~~/shared/types/admin'

addIcons(RiAddLine, RiDeleteBinLine, RiEditLine, RiHeartPulseLine)

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: services, refresh, pending } = await useFetch<MedicalServiceRow[]>('/api/admin/services')

const showForm = ref(false)
const editing = ref<MedicalServiceRow | null>(null)
const submitting = ref(false)
const formError = ref('')
const pageError = ref('')
const notice = ref('')
const deleteTarget = ref<MedicalServiceRow | null>(null)
const deleting = ref(false)

function openCreate() {
  editing.value = null
  formError.value = ''
  showForm.value = true
}

function openEdit(service: MedicalServiceRow) {
  editing.value = service
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editing.value = null
  formError.value = ''
}

async function saveService(payload: ServicePayload) {
  submitting.value = true
  formError.value = ''

  try {
    if (editing.value) {
      await $fetch(`/api/admin/services/${editing.value.id}`, { method: 'PATCH', body: payload })
      notice.value = 'Layanan diperbarui.'
    } else {
      await $fetch('/api/admin/services', { method: 'POST', body: payload })
      notice.value = 'Layanan baru ditambahkan.'
    }

    await refresh()
    closeForm()
  } catch (error) {
    formError.value = apiErrorMessage(error, 'Gagal menyimpan layanan.')
  } finally {
    submitting.value = false
  }
}

async function deleteService() {
  if (!deleteTarget.value) return
  deleting.value = true
  pageError.value = ''

  try {
    await $fetch(`/api/admin/services/${deleteTarget.value.id}`, { method: 'DELETE' })
    notice.value = 'Layanan dihapus.'
    await refresh()
    deleteTarget.value = null
  } catch (error) {
    pageError.value = apiErrorMessage(error, 'Gagal menghapus layanan.')
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'Kelola Layanan | Klinik Sehat' })
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Manajemen</p>
        <h1 class="font-display text-3xl font-bold text-navy">Layanan</h1>
        <p class="mt-2 text-base text-[#64748b]">Atur layanan medis dan durasi konsultasinya.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617]" @click="openCreate"><OhVueIcon name="ri-add-line" /> Tambah layanan</button>
    </div>

    <p v-if="pageError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ pageError }}</p>
    <p v-if="notice" class="mb-4 rounded-lg bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ notice }}</p>

    <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <div v-if="pending" class="p-8 text-center text-base text-[#64748b]">Memuat layanan...</div>
      <div v-else-if="!services?.length" class="p-10 text-center">
        <OhVueIcon name="ri-heart-pulse-line" class="mx-auto mb-3 size-10 text-[#cbd5e1]" />
        <p class="text-base font-semibold text-navy">Belum ada layanan</p>
        <p class="mt-1 text-sm text-[#64748b]">Tambahkan layanan yang tersedia di klinik.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left">
          <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
            <tr><th class="px-5 py-3 font-semibold">Layanan</th><th class="px-5 py-3 font-semibold">Durasi</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr>
          </thead>
          <tbody class="divide-y divide-[#e2e8f0]">
            <tr v-for="service in services" :key="service.id">
              <td class="px-5 py-4"><p class="font-semibold text-navy">{{ service.name }}</p><p class="mt-0.5 max-w-lg text-sm text-[#64748b]">{{ service.description || 'Belum ada deskripsi' }}</p></td>
              <td class="px-5 py-4 text-base text-[#475569]">{{ service.durationMinutes }} menit</td>
              <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-sm font-medium" :class="service.isActive ? 'bg-[#ecfdf5] text-sage-dark' : 'bg-[#f1f5f9] text-[#64748b]'">{{ service.isActive ? 'Aktif' : 'Nonaktif' }}</span></td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button type="button" class="grid size-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9]" aria-label="Edit layanan" @click="openEdit(service)"><OhVueIcon name="ri-edit-line" /></button>
                  <button type="button" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2]" aria-label="Hapus layanan" @click="deleteTarget = service"><OhVueIcon name="ri-delete-bin-line" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminModal v-if="showForm" :title="editing ? 'Edit layanan' : 'Tambah layanan'" @close="closeForm">
      <p v-if="formError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ formError }}</p>
      <ServiceForm :key="editing?.id ?? 'new'" :service="editing" :submitting="submitting" @save="saveService" @cancel="closeForm" />
    </AdminModal>
    <AdminConfirmDialog
      v-if="deleteTarget"
      title="Hapus layanan?"
      :description="`Layanan ${deleteTarget.name} akan dihapus. Tindakan ini tidak dapat dibatalkan.`"
      :submitting="deleting"
      @confirm="deleteService"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
