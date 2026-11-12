import { ref, type Ref } from 'vue'
import clinic from '~/assets/demo/clinic.json'
import doctors from '~/assets/demo/doctors.json'
import faqs from '~/assets/demo/faqs.json'
import facilities from '~/assets/demo/facilities.json'
import services from '~/assets/demo/services.json'
import testimonials from '~/assets/demo/testimonials.json'

const demoData = { clinic, doctors, faqs, facilities, services, testimonials }

export type DemoDataset = keyof typeof demoData

export function isDemoMode() {
  return useRuntimeConfig().public.demo === true
}

export async function usePublicData<T>(key: DemoDataset): Promise<{ data: Ref<T | null> }> {
  if (isDemoMode()) return { data: ref(demoData[key]) as Ref<T | null> }
  const { data } = await useFetch<T>(`/api/public/${key}`)
  return { data: data as Ref<T | null> }
}
