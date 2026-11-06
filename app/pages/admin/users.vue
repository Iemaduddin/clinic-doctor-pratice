<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiEyeLine, RiEyeOffLine, RiGroupLine } from 'oh-vue-icons/icons/ri'

addIcons(RiAddLine, RiDeleteBinLine, RiEditLine, RiEyeLine, RiEyeOffLine, RiGroupLine)
definePageMeta({ layout: 'admin', middleware: 'admin' })

type UserRow = { id: string; name: string; email: string; phone: string | null; role: string; createdAt: string }
type UserPage = { users: UserRow[]; total: number; page: number; pageSize: number; totalPages: number }
const roles = ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'PATIENT'] as const
const search = ref('')
const debouncedSearch = ref('')
const filterRole = ref('')
const sortBy = ref<'name' | 'email' | 'phone' | 'role' | 'createdAt'>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
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
watch([filterRole, sortBy, sortOrder, pageSize], () => { page.value = 1 })
const { data, refresh, pending, error: fetchError } = await useFetch<UserPage>('/api/admin/users', {
  query: { page, pageSize, search: debouncedSearch, role: filterRole, sortBy, sortOrder },
  watch: [page, pageSize, debouncedSearch, filterRole, sortBy, sortOrder]
})
const users = computed(() => data.value?.users ?? [])
const showForm = ref(false)
const editing = ref<UserRow | null>(null)
const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const role = ref<(typeof roles)[number]>('PATIENT')
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref<UserRow | null>(null)
const error = ref('')
const notice = ref('')

function toggleSort(column: typeof sortBy.value) {
  if (sortBy.value === column) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

function openCreate() {
  editing.value = null
  name.value = ''
  email.value = ''
  phone.value = ''
  password.value = ''
  showPassword.value = false
  role.value = 'PATIENT'
  error.value = ''
  showForm.value = true
}
function openEdit(user: UserRow) {
  editing.value = user
  name.value = user.name
  email.value = user.email
  phone.value = user.phone ?? ''
  password.value = ''
  showPassword.value = false
  role.value = user.role as (typeof roles)[number]
  error.value = ''
  showForm.value = true
}
async function saveUser() {
  saving.value = true
  error.value = ''
  try {
    if (editing.value) {
      await $fetch(`/api/admin/users/${editing.value.id}`, { method: 'PATCH', body: { name: name.value, phone: phone.value || null, ...(password.value ? { password: password.value } : {}), role: role.value } })
      notice.value = 'Pengguna diperbarui.'
    } else {
      await $fetch('/api/admin/users', { method: 'POST', body: { name: name.value, email: email.value, phone: phone.value || null, password: password.value, role: role.value } })
      notice.value = 'Pengguna berhasil ditambahkan.'
    }
    await refresh()
    showForm.value = false
  } catch (cause) {
    error.value = apiErrorMessage(cause, 'Gagal menyimpan pengguna.')
  } finally {
    saving.value = false
  }
}
async function deleteUser() {
  if (!deleteTarget.value) return
  deleting.value = true
  error.value = ''
  try {
    await $fetch(`/api/admin/users/${deleteTarget.value.id}`, { method: 'DELETE' })
    notice.value = 'Pengguna dihapus.'
    deleteTarget.value = null
    await refresh()
  } catch (cause) {
    error.value = apiErrorMessage(cause, 'Gagal menghapus pengguna.')
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}
useHead({ title: 'Kelola Pengguna | Klinik Sehat' })
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Manajemen</p><h1 class="font-display text-3xl font-bold text-navy">Pengguna</h1><p class="mt-2 text-base text-[#64748b]">Kelola akun dan peran pengguna.</p></div>
      <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white hover:bg-[#020617]" @click="openCreate"><OhVueIcon name="ri-add-line" /> Tambah pengguna</button>
    </div>
    <p v-if="error" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ error }}</p>
    <p v-if="notice" class="mb-4 rounded-lg bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ notice }}</p>
    <div class="mb-4 flex flex-wrap gap-3">
      <input v-model="search" type="search" placeholder="Cari nama, email, nomor HP..." aria-label="Cari pengguna" class="h-[42px] min-w-60 flex-1 rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none focus:border-navy">
      <select v-model="filterRole" aria-label="Filter berdasarkan peran" class="h-[42px] rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none focus:border-navy">
        <option value="">Semua peran</option><option v-for="item in roles" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model.number="pageSize" aria-label="Jumlah baris per halaman" class="h-[42px] rounded-lg border border-[#e2e8f0] bg-white px-3.5 text-base text-navy outline-none focus:border-navy">
        <option :value="10">10 per halaman</option><option :value="25">25 per halaman</option><option :value="50">50 per halaman</option>
      </select>
    </div>
    <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <div v-if="pending" class="p-8 text-center text-[#64748b]">Memuat pengguna...</div>
      <div v-else-if="fetchError" class="p-8 text-center text-[#b91c1c]" role="alert">{{ apiErrorMessage(fetchError, 'Gagal memuat pengguna.') }}</div>
      <div v-else-if="!users.length" class="p-10 text-center"><OhVueIcon name="ri-group-line" class="mx-auto mb-3 size-10 text-[#cbd5e1]" /><p class="font-semibold text-navy">Tidak ada pengguna yang cocok.</p></div>
      <div v-else class="overflow-x-auto"><table class="w-full min-w-[700px] text-left"><thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]"><tr><th class="px-5 py-3 font-semibold"><button type="button" @click="toggleSort('name')">Nama{{ sortBy === 'name' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '' }}</button></th><th class="px-5 py-3 font-semibold"><button type="button" @click="toggleSort('email')">Email{{ sortBy === 'email' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '' }}</button></th><th class="px-5 py-3 font-semibold"><button type="button" @click="toggleSort('phone')">Nomor HP{{ sortBy === 'phone' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '' }}</button></th><th class="px-5 py-3 font-semibold"><button type="button" @click="toggleSort('role')">Peran{{ sortBy === 'role' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '' }}</button></th><th class="px-5 py-3 font-semibold"><button type="button" @click="toggleSort('createdAt')">Dibuat{{ sortBy === 'createdAt' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '' }}</button></th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr></thead><tbody class="divide-y divide-[#e2e8f0]"><tr v-for="user in users" :key="user.id"><td class="px-5 py-4 font-semibold text-navy">{{ user.name }}</td><td class="px-5 py-4 text-[#475569]">{{ user.email }}</td><td class="px-5 py-4 text-[#475569]">{{ user.phone || '—' }}</td><td class="px-5 py-4 text-[#475569]">{{ user.role }}</td><td class="px-5 py-4 text-[#475569]">{{ new Date(user.createdAt).toLocaleDateString('id-ID') }}</td><td class="px-5 py-4"><div class="flex justify-end gap-1"><button type="button" class="grid size-9 place-items-center rounded-lg text-[#475569] hover:bg-[#f1f5f9]" aria-label="Edit pengguna" @click="openEdit(user)"><OhVueIcon name="ri-edit-line" /></button><button type="button" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] hover:bg-[#fef2f2]" aria-label="Hapus pengguna" @click="deleteTarget = user"><OhVueIcon name="ri-delete-bin-line" /></button></div></td></tr></tbody></table></div>
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] px-5 py-4 text-sm text-[#64748b]">
        <span>Menampilkan {{ data?.total ? ((page - 1) * pageSize + 1) : 0 }}–{{ Math.min(page * pageSize, data?.total ?? 0) }} dari {{ data?.total ?? 0 }} pengguna</span>
        <div class="flex items-center gap-2"><button type="button" :disabled="page <= 1 || pending" class="rounded-lg border border-[#e2e8f0] px-3 py-2 font-medium text-navy disabled:opacity-40" @click="page--">Sebelumnya</button><span>Halaman {{ page }} dari {{ data?.totalPages ?? 1 }}</span><button type="button" :disabled="page >= (data?.totalPages ?? 1) || pending" class="rounded-lg border border-[#e2e8f0] px-3 py-2 font-medium text-navy disabled:opacity-40" @click="page++">Berikutnya</button></div>
      </div>
    </div>
    <AdminModal v-if="showForm" :title="editing ? 'Edit pengguna' : 'Tambah pengguna'" @close="showForm = false">
      <form class="space-y-4" @submit.prevent="saveUser">
        <div><label for="user-name" class="mb-1.5 block text-sm font-medium text-navy">Nama</label><input id="user-name" v-model="name" required maxlength="100" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-navy outline-none focus:border-navy"></div>
        <div><label for="user-phone" class="mb-1.5 block text-sm font-medium text-navy">Nomor HP</label><input id="user-phone" v-model="phone" type="tel" maxlength="30" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-navy outline-none focus:border-navy"></div>
        <div v-if="!editing"><label for="user-email" class="mb-1.5 block text-sm font-medium text-navy">Email</label><input id="user-email" v-model="email" type="email" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-navy outline-none focus:border-navy"></div>
        <div><label for="user-password" class="mb-1.5 block text-sm font-medium text-navy">{{ editing ? 'Password baru (opsional)' : 'Password' }}</label><div class="relative"><input id="user-password" v-model="password" :type="showPassword ? 'text' : 'password'" :required="!editing" minlength="8" maxlength="100" autocomplete="new-password" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 pr-12 text-navy outline-none focus:border-navy"><button type="button" class="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#64748b]" :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'" @click="showPassword = !showPassword"><OhVueIcon :name="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'" /></button></div><p v-if="editing" class="mt-1 text-xs text-[#64748b]">Kosongkan jika tidak ingin mengubah password.</p><p v-else class="mt-1 text-xs text-[#64748b]">Minimal 8 karakter.</p></div>
        <div><label for="user-role" class="mb-1.5 block text-sm font-medium text-navy">Peran</label><select id="user-role" v-model="role" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-navy outline-none focus:border-navy"><option v-for="item in roles" :key="item" :value="item">{{ item }}</option></select></div>
        <p v-if="error" class="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ error }}</p>
        <div class="flex justify-end gap-3"><button type="button" class="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-[#475569]" @click="showForm = false">Batal</button><button type="submit" :disabled="saving" class="rounded-lg bg-navy px-4 py-2.5 font-bold text-white disabled:opacity-50">{{ saving ? 'Menyimpan...' : 'Simpan' }}</button></div>
      </form>
    </AdminModal>
    <AdminConfirmDialog v-if="deleteTarget" title="Hapus pengguna?" :description="`Akun ${deleteTarget.name} dan sesi terkait akan dihapus.`" :submitting="deleting" @confirm="deleteUser" @cancel="deleteTarget = null" />
  </div>
</template>
