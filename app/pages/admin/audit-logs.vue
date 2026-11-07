<script setup lang="ts">
import type { Paginated } from '~~/shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface AuditLog { actorName: string; action: string; entity: string; summary: string; createdAt: string }
const page = ref(1)
const pageSize = ref(10)
const { data } = await useFetch<Paginated<AuditLog>>('/api/admin/audit-logs', { query: { page, pageSize }, watch: [page, pageSize] })
const logs = computed(() => data.value?.items ?? [])
useHead({ title: 'Audit Log | Klinik Sehat' })
</script>

<template>
  <section>
    <div class="mb-6 flex items-end justify-between gap-4">
      <div><h1 class="font-display text-3xl font-bold text-navy">Audit Log</h1><p class="mt-2 text-base text-[#64748b]">Riwayat tindakan admin.</p></div>
      <label class="text-sm text-[#64748b]">Baris
        <select v-model.number="pageSize" class="ml-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2"><option :value="10">10</option><option :value="25">25</option><option :value="50">50</option></select>
      </label>
    </div>
    <div class="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
      <table class="w-full text-left text-sm"><thead class="bg-[#f8fafc] text-[#64748b]"><tr><th class="p-4">Tanggal</th><th class="p-4">Admin</th><th class="p-4">Tindakan</th><th class="p-4">Entitas</th><th class="p-4">Ringkasan</th></tr></thead>
        <tbody><tr v-for="(log, index) in logs" :key="`${log.createdAt}-${index}`" class="border-t border-[#e2e8f0]"><td class="whitespace-nowrap p-4">{{ new Date(log.createdAt).toLocaleString('id-ID') }}</td><td class="p-4">{{ log.actorName }}</td><td class="p-4">{{ log.action }}</td><td class="p-4">{{ log.entity }}</td><td class="p-4">{{ log.summary }}</td></tr><tr v-if="!logs.length"><td colspan="5" class="p-8 text-center text-[#64748b]">Belum ada aktivitas.</td></tr></tbody>
      </table>
    </div>
    <div class="mt-4 flex items-center justify-between"><span class="text-sm text-[#64748b]">{{ data?.total ?? 0 }} catatan</span><div class="flex gap-2"><button class="rounded-lg border px-4 py-2 disabled:opacity-40" :disabled="page <= 1" @click="page--">Sebelumnya</button><span class="px-3 py-2">{{ page }} / {{ data?.totalPages ?? 1 }}</span><button class="rounded-lg border px-4 py-2 disabled:opacity-40" :disabled="page >= (data?.totalPages ?? 1)" @click="page++">Berikutnya</button></div></div>
  </section>
</template>
