<script setup lang="ts">
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiFileTextLine } from 'oh-vue-icons/icons/ri'

addIcons(RiAddLine, RiDeleteBinLine, RiEditLine, RiFileTextLine)

definePageMeta({ layout: 'admin', middleware: 'admin' })

type ClinicProfileRow = {
  id: string
  name: string
  tagline: string | null
  about: string | null
  address: string
  phone: string
  whatsapp: string
  email: string
  mapsUrl: string | null
  timezone: string
}

type FacilityRow = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

type TestimonialRow = {
  id: string
  patientName: string
  content: string
  rating: number
  isPublished: boolean
}

type FaqRow = {
  id: string
  question: string
  answer: string
  sortOrder: number
  isPublished: boolean
}

type FormType = 'facility' | 'testimonial' | 'faq'
type DeleteTarget = { type: FormType; id: string; label: string }

const { data: clinic, refresh: refreshClinic } = await useFetch<ClinicProfileRow>('/api/admin/content/clinic')
const { data: facilities, refresh: refreshFacilities, pending: pendingFacilities } = await useFetch<FacilityRow[]>('/api/admin/content/facilities')
const { data: testimonials, refresh: refreshTestimonials, pending: pendingTestimonials } = await useFetch<TestimonialRow[]>('/api/admin/content/testimonials')
const { data: faqs, refresh: refreshFaqs, pending: pendingFaqs } = await useFetch<FaqRow[]>('/api/admin/content/faqs')

const clinicForm = reactive({
  name: clinic.value?.name ?? '',
  tagline: clinic.value?.tagline ?? '',
  about: clinic.value?.about ?? '',
  address: clinic.value?.address ?? '',
  phone: clinic.value?.phone ?? '',
  whatsapp: clinic.value?.whatsapp ?? '',
  email: clinic.value?.email ?? '',
  mapsUrl: clinic.value?.mapsUrl ?? '',
  timezone: clinic.value?.timezone ?? 'Asia/Jakarta'
})

const savingClinic = ref(false)
const clinicError = ref('')

const showForm = ref(false)
const formType = ref<FormType>('facility')
const editingId = ref<string | null>(null)
const submitting = ref(false)
const formError = ref('')
const pageError = ref('')
const notice = ref('')

const facilityForm = reactive({
  name: '',
  description: '',
  imageUrl: '',
  sortOrder: 0
})

const testimonialForm = reactive({
  patientName: '',
  content: '',
  rating: 5,
  isPublished: false
})

const faqForm = reactive({
  question: '',
  answer: '',
  sortOrder: 0,
  isPublished: false
})

const deleteTarget = ref<DeleteTarget | null>(null)
const deleting = ref(false)

const endpoints: Record<FormType, string> = {
  facility: '/api/admin/content/facilities',
  testimonial: '/api/admin/content/testimonials',
  faq: '/api/admin/content/faqs'
}

const formTitle = computed(() => {
  const label = formType.value === 'facility' ? 'fasilitas' : formType.value === 'testimonial' ? 'testimoni' : 'FAQ'
  return `${editingId.value ? 'Edit' : 'Tambah'} ${label}`
})

async function saveClinic() {
  savingClinic.value = true
  clinicError.value = ''

  try {
    const saved = await $fetch<ClinicProfileRow>('/api/admin/content/clinic', {
      method: 'PATCH',
      body: {
        name: clinicForm.name,
        tagline: clinicForm.tagline || null,
        about: clinicForm.about || null,
        address: clinicForm.address,
        phone: clinicForm.phone,
        whatsapp: clinicForm.whatsapp,
        email: clinicForm.email,
        mapsUrl: clinicForm.mapsUrl || null,
        timezone: clinicForm.timezone
      }
    })

    Object.assign(clinicForm, {
      name: saved.name,
      tagline: saved.tagline ?? '',
      about: saved.about ?? '',
      address: saved.address,
      phone: saved.phone,
      whatsapp: saved.whatsapp,
      email: saved.email,
      mapsUrl: saved.mapsUrl ?? '',
      timezone: saved.timezone
    })
    await refreshClinic()
    notice.value = 'Profil klinik diperbarui.'
  } catch (error) {
    clinicError.value = apiErrorMessage(error, 'Gagal menyimpan profil klinik.')
  } finally {
    savingClinic.value = false
  }
}

function openFacility(item?: FacilityRow) {
  formType.value = 'facility'
  editingId.value = item?.id ?? null
  Object.assign(facilityForm, {
    name: item?.name ?? '',
    description: item?.description ?? '',
    imageUrl: item?.imageUrl ?? '',
    sortOrder: item?.sortOrder ?? 0
  })
  formError.value = ''
  showForm.value = true
}

function openTestimonial(item?: TestimonialRow) {
  formType.value = 'testimonial'
  editingId.value = item?.id ?? null
  Object.assign(testimonialForm, {
    patientName: item?.patientName ?? '',
    content: item?.content ?? '',
    rating: item?.rating ?? 5,
    isPublished: item?.isPublished ?? false
  })
  formError.value = ''
  showForm.value = true
}

function openFaq(item?: FaqRow) {
  formType.value = 'faq'
  editingId.value = item?.id ?? null
  Object.assign(faqForm, {
    question: item?.question ?? '',
    answer: item?.answer ?? '',
    sortOrder: item?.sortOrder ?? 0,
    isPublished: item?.isPublished ?? false
  })
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  formError.value = ''
}

async function saveRecord() {
  submitting.value = true
  formError.value = ''

  const type = formType.value
  const base = endpoints[type]
  let body: Record<string, unknown> = {}

  if (type === 'facility') {
    body = {
      name: facilityForm.name,
      description: facilityForm.description || null,
      imageUrl: facilityForm.imageUrl || null,
      sortOrder: facilityForm.sortOrder
    }
  } else if (type === 'testimonial') {
    body = {
      patientName: testimonialForm.patientName,
      content: testimonialForm.content,
      rating: testimonialForm.rating,
      isPublished: testimonialForm.isPublished
    }
  } else {
    body = {
      question: faqForm.question,
      answer: faqForm.answer,
      sortOrder: faqForm.sortOrder,
      isPublished: faqForm.isPublished
    }
  }

  try {
    if (editingId.value) {
      await $fetch(`${base}/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch(base, { method: 'POST', body })
    }

    if (type === 'facility') {
      notice.value = editingId.value ? 'Fasilitas diperbarui.' : 'Fasilitas baru ditambahkan.'
      await refreshFacilities()
    } else if (type === 'testimonial') {
      notice.value = editingId.value ? 'Testimoni diperbarui.' : 'Testimoni baru ditambahkan.'
      await refreshTestimonials()
    } else {
      notice.value = editingId.value ? 'FAQ diperbarui.' : 'FAQ baru ditambahkan.'
      await refreshFaqs()
    }

    closeForm()
  } catch (error) {
    formError.value = apiErrorMessage(error, 'Gagal menyimpan data.')
  } finally {
    submitting.value = false
  }
}

function confirmDelete(type: FormType, id: string, label: string) {
  deleteTarget.value = { type, id, label }
}

async function deleteRecord() {
  if (!deleteTarget.value) return
  const target = deleteTarget.value
  deleting.value = true
  pageError.value = ''

  try {
    await $fetch(`${endpoints[target.type]}/${target.id}`, { method: 'DELETE' })

    if (target.type === 'facility') {
      notice.value = 'Fasilitas dihapus.'
      await refreshFacilities()
    } else if (target.type === 'testimonial') {
      notice.value = 'Testimoni dihapus.'
      await refreshTestimonials()
    } else {
      notice.value = 'FAQ dihapus.'
      await refreshFaqs()
    }

    deleteTarget.value = null
  } catch (error) {
    pageError.value = apiErrorMessage(error, 'Gagal menghapus data.')
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'Kelola Konten | Klinik Sehat' })
</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-sage">Manajemen</p>
      <h1 class="font-display text-3xl font-bold text-navy">Konten</h1>
      <p class="mt-2 text-base text-[#64748b]">Kelola profil klinik, fasilitas, testimoni, dan FAQ.</p>
    </div>

    <p v-if="pageError" class="rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ pageError }}</p>
    <p v-if="notice" class="rounded-lg bg-[#ecfdf5] px-4 py-3 text-sm text-sage-dark" role="status">{{ notice }}</p>

    <section class="rounded-2xl border border-[#e2e8f0] bg-white p-6">
      <div class="mb-5 flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-xl bg-[#ecfdf5] text-sage-dark"><OhVueIcon name="ri-file-text-line" class="size-5" /></span>
        <div>
          <h2 class="font-display text-xl font-bold text-navy">Profil klinik</h2>
          <p class="text-sm text-[#64748b]">Informasi utama yang tampil di situs publik.</p>
        </div>
      </div>

      <p v-if="clinicError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ clinicError }}</p>

      <form class="space-y-4" @submit.prevent="saveClinic">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-name">Nama klinik</label>
            <input id="clinic-name" v-model="clinicForm.name" required minlength="2" maxlength="120" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Klinik Sehat">
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-timezone">Zona waktu</label>
            <input id="clinic-timezone" v-model="clinicForm.timezone" required maxlength="64" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Asia/Jakarta">
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-tagline">Tagline</label>
          <input id="clinic-tagline" v-model="clinicForm.tagline" maxlength="160" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Perawatan terpercaya, setiap hari">
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-about">Tentang</label>
          <textarea id="clinic-about" v-model="clinicForm.about" maxlength="4000" rows="4" class="w-full rounded-lg border border-[#e2e8f0] px-3.5 py-3 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Cerita singkat tentang klinik."></textarea>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-address">Alamat</label>
          <input id="clinic-address" v-model="clinicForm.address" required minlength="5" maxlength="300" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Jl. Melati Raya No. 18">
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-phone">Telepon</label>
            <input id="clinic-phone" v-model="clinicForm.phone" required minlength="5" maxlength="30" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="021xxxxxxx">
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-whatsapp">WhatsApp</label>
            <input id="clinic-whatsapp" v-model="clinicForm.whatsapp" required minlength="5" maxlength="30" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="081234567890">
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-email">Email</label>
            <input id="clinic-email" v-model="clinicForm.email" type="email" required maxlength="120" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="halo@klinik.id">
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="clinic-maps">URL peta</label>
          <input id="clinic-maps" v-model="clinicForm.mapsUrl" type="url" maxlength="500" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="https://maps.google.com/...">
        </div>
        <div class="flex justify-end pt-2">
          <button type="submit" :disabled="savingClinic" class="rounded-lg bg-navy px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-40">{{ savingClinic ? 'Menyimpan...' : 'Simpan profil' }}</button>
        </div>
      </form>
    </section>

    <section>
      <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="font-display text-xl font-bold text-navy">Fasilitas</h2>
          <p class="mt-1 text-sm text-[#64748b]">Daftar fasilitas yang tersedia di klinik.</p>
        </div>
        <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617]" @click="openFacility()"><OhVueIcon name="ri-add-line" /> Tambah fasilitas</button>
      </div>

      <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
        <div v-if="pendingFacilities" class="p-8 text-center text-base text-[#64748b]">Memuat fasilitas...</div>
        <div v-else-if="!facilities?.length" class="p-10 text-center">
          <OhVueIcon name="ri-file-text-line" class="mx-auto mb-3 size-10 text-[#cbd5e1]" />
          <p class="text-base font-semibold text-navy">Belum ada fasilitas</p>
          <p class="mt-1 text-sm text-[#64748b]">Tambahkan fasilitas yang dimiliki klinik.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left">
            <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
              <tr><th class="px-5 py-3 font-semibold">Fasilitas</th><th class="px-5 py-3 font-semibold">Gambar</th><th class="px-5 py-3 font-semibold">Urutan</th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr v-for="item in facilities" :key="item.id">
                <td class="px-5 py-4"><p class="font-semibold text-navy">{{ item.name }}</p><p class="mt-0.5 max-w-lg text-sm text-[#64748b]">{{ item.description || 'Belum ada deskripsi' }}</p></td>
                <td class="px-5 py-4 text-sm text-[#475569]"><a v-if="item.imageUrl" :href="item.imageUrl" target="_blank" rel="noopener noreferrer" class="text-sage-dark underline">Lihat gambar</a><span v-else>-</span></td>
                <td class="px-5 py-4 text-base text-[#475569]">{{ item.sortOrder }}</td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-1">
                    <button type="button" class="grid size-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9]" aria-label="Edit fasilitas" @click="openFacility(item)"><OhVueIcon name="ri-edit-line" /></button>
                    <button type="button" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2]" aria-label="Hapus fasilitas" @click="confirmDelete('facility', item.id, item.name)"><OhVueIcon name="ri-delete-bin-line" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section>
      <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="font-display text-xl font-bold text-navy">Testimoni</h2>
          <p class="mt-1 text-sm text-[#64748b]">Ulasan pasien yang tampil di situs publik.</p>
        </div>
        <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617]" @click="openTestimonial()"><OhVueIcon name="ri-add-line" /> Tambah testimoni</button>
      </div>

      <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
        <div v-if="pendingTestimonials" class="p-8 text-center text-base text-[#64748b]">Memuat testimoni...</div>
        <div v-else-if="!testimonials?.length" class="p-10 text-center">
          <OhVueIcon name="ri-file-text-line" class="mx-auto mb-3 size-10 text-[#cbd5e1]" />
          <p class="text-base font-semibold text-navy">Belum ada testimoni</p>
          <p class="mt-1 text-sm text-[#64748b]">Tambahkan testimoni dari pasien.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left">
            <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
              <tr><th class="px-5 py-3 font-semibold">Pasien</th><th class="px-5 py-3 font-semibold">Rating</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr v-for="item in testimonials" :key="item.id">
                <td class="px-5 py-4"><p class="font-semibold text-navy">{{ item.patientName }}</p><p class="mt-0.5 max-w-lg text-sm text-[#64748b]">{{ item.content }}</p></td>
                <td class="px-5 py-4 text-base text-[#475569]">{{ item.rating }} / 5</td>
                <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-sm font-medium" :class="item.isPublished ? 'bg-[#ecfdf5] text-sage-dark' : 'bg-[#f1f5f9] text-[#64748b]'">{{ item.isPublished ? 'Terbit' : 'Draf' }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-1">
                    <button type="button" class="grid size-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9]" aria-label="Edit testimoni" @click="openTestimonial(item)"><OhVueIcon name="ri-edit-line" /></button>
                    <button type="button" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2]" aria-label="Hapus testimoni" @click="confirmDelete('testimonial', item.id, item.patientName)"><OhVueIcon name="ri-delete-bin-line" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section>
      <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="font-display text-xl font-bold text-navy">FAQ</h2>
          <p class="mt-1 text-sm text-[#64748b]">Pertanyaan yang sering diajukan pasien.</p>
        </div>
        <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617]" @click="openFaq()"><OhVueIcon name="ri-add-line" /> Tambah FAQ</button>
      </div>

      <div class="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
        <div v-if="pendingFaqs" class="p-8 text-center text-base text-[#64748b]">Memuat FAQ...</div>
        <div v-else-if="!faqs?.length" class="p-10 text-center">
          <OhVueIcon name="ri-file-text-line" class="mx-auto mb-3 size-10 text-[#cbd5e1]" />
          <p class="text-base font-semibold text-navy">Belum ada FAQ</p>
          <p class="mt-1 text-sm text-[#64748b]">Tambahkan pertanyaan yang sering diajukan.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left">
            <thead class="border-b border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#64748b]">
              <tr><th class="px-5 py-3 font-semibold">Pertanyaan</th><th class="px-5 py-3 font-semibold">Urutan</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 text-right font-semibold">Aksi</th></tr>
            </thead>
            <tbody class="divide-y divide-[#e2e8f0]">
              <tr v-for="item in faqs" :key="item.id">
                <td class="px-5 py-4"><p class="font-semibold text-navy">{{ item.question }}</p><p class="mt-0.5 max-w-lg text-sm text-[#64748b]">{{ item.answer }}</p></td>
                <td class="px-5 py-4 text-base text-[#475569]">{{ item.sortOrder }}</td>
                <td class="px-5 py-4"><span class="rounded-full px-2.5 py-1 text-sm font-medium" :class="item.isPublished ? 'bg-[#ecfdf5] text-sage-dark' : 'bg-[#f1f5f9] text-[#64748b]'">{{ item.isPublished ? 'Terbit' : 'Draf' }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-1">
                    <button type="button" class="grid size-9 place-items-center rounded-lg text-[#475569] transition-colors hover:bg-[#f1f5f9]" aria-label="Edit FAQ" @click="openFaq(item)"><OhVueIcon name="ri-edit-line" /></button>
                    <button type="button" class="grid size-9 place-items-center rounded-lg text-[#b91c1c] transition-colors hover:bg-[#fef2f2]" aria-label="Hapus FAQ" @click="confirmDelete('faq', item.id, item.question)"><OhVueIcon name="ri-delete-bin-line" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <AdminModal v-if="showForm" :title="formTitle" @close="closeForm">
      <p v-if="formError" class="mb-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]" role="alert">{{ formError }}</p>

      <form v-if="formType === 'facility'" class="space-y-4" @submit.prevent="saveRecord">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="facility-name">Nama fasilitas</label>
          <input id="facility-name" v-model="facilityForm.name" required minlength="2" maxlength="120" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Ruang tunggu nyaman">
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="facility-description">Deskripsi</label>
          <textarea id="facility-description" v-model="facilityForm.description" maxlength="1000" rows="3" class="w-full rounded-lg border border-[#e2e8f0] px-3.5 py-3 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Penjelasan singkat fasilitas."></textarea>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="facility-image">URL gambar</label>
            <input id="facility-image" v-model="facilityForm.imageUrl" type="url" maxlength="500" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="https://...">
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="facility-order">Urutan</label>
            <input id="facility-order" v-model.number="facilityForm.sortOrder" type="number" min="0" max="9999" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-base font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]" @click="closeForm">Batal</button>
          <button type="submit" :disabled="submitting" class="rounded-lg bg-navy px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-40">{{ submitting ? 'Menyimpan...' : 'Simpan fasilitas' }}</button>
        </div>
      </form>

      <form v-else-if="formType === 'testimonial'" class="space-y-4" @submit.prevent="saveRecord">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="testimonial-name">Nama pasien</label>
          <input id="testimonial-name" v-model="testimonialForm.patientName" required minlength="2" maxlength="120" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Nama pasien">
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="testimonial-content">Isi testimoni</label>
          <textarea id="testimonial-content" v-model="testimonialForm.content" required minlength="5" maxlength="2000" rows="4" class="w-full rounded-lg border border-[#e2e8f0] px-3.5 py-3 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Pengalaman pasien selama berobat."></textarea>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="testimonial-rating">Rating</label>
            <input id="testimonial-rating" v-model.number="testimonialForm.rating" type="number" min="1" max="5" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
          </div>
          <div class="flex items-end pb-2.5">
            <label class="flex items-center gap-2 text-base text-[#475569]"><input v-model="testimonialForm.isPublished" type="checkbox" class="size-[18px] rounded border-[#cbd5e1] accent-navy"> Terbitkan</label>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-base font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]" @click="closeForm">Batal</button>
          <button type="submit" :disabled="submitting" class="rounded-lg bg-navy px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-40">{{ submitting ? 'Menyimpan...' : 'Simpan testimoni' }}</button>
        </div>
      </form>

      <form v-else class="space-y-4" @submit.prevent="saveRecord">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="faq-question">Pertanyaan</label>
          <input id="faq-question" v-model="faqForm.question" required minlength="5" maxlength="300" class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Apa jam operasional klinik?">
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="faq-answer">Jawaban</label>
          <textarea id="faq-answer" v-model="faqForm.answer" required minlength="5" maxlength="4000" rows="4" class="w-full rounded-lg border border-[#e2e8f0] px-3.5 py-3 text-base text-navy outline-none transition-colors focus:border-navy" placeholder="Jawaban singkat dan jelas."></textarea>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-[#0f172a]" for="faq-order">Urutan</label>
            <input id="faq-order" v-model.number="faqForm.sortOrder" type="number" min="0" max="9999" required class="h-[42px] w-full rounded-lg border border-[#e2e8f0] px-3.5 text-base text-navy outline-none transition-colors focus:border-navy">
          </div>
          <div class="flex items-end pb-2.5">
            <label class="flex items-center gap-2 text-base text-[#475569]"><input v-model="faqForm.isPublished" type="checkbox" class="size-[18px] rounded border-[#cbd5e1] accent-navy"> Terbitkan</label>
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-base font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]" @click="closeForm">Batal</button>
          <button type="submit" :disabled="submitting" class="rounded-lg bg-navy px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-[#020617] disabled:cursor-not-allowed disabled:opacity-40">{{ submitting ? 'Menyimpan...' : 'Simpan FAQ' }}</button>
        </div>
      </form>
    </AdminModal>

    <AdminConfirmDialog
      v-if="deleteTarget"
      title="Hapus data?"
      :description="`${deleteTarget.label} akan dihapus. Tindakan ini tidak dapat dibatalkan.`"
      :submitting="deleting"
      @confirm="deleteRecord"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
