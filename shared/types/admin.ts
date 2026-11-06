export interface SpecializationOption {
  id: string
  name: string
  description?: string | null
  _count?: { doctors: number }
}

export interface DoctorRow {
  id: string
  name: string
  slug: string
  bio: string | null
  photoUrl: string | null
  slotDurationMinutes: number
  isActive: boolean
  specializationId: string
  specialization: SpecializationOption
  schedules: ScheduleRow[]
}

export interface DoctorOption {
  id: string
  name: string
  isActive: boolean
}

export interface MedicalServiceRow {
  id: string
  name: string
  slug: string
  description: string | null
  durationMinutes: number
  isActive: boolean
}

export interface ScheduleRow {
  id: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  doctor: DoctorOption
}

export interface DoctorPayload {
  name: string
  specializationId: string
  bio: string | null
  photoUrl: string | null
  slotDurationMinutes: number
  isActive: boolean
}

export interface ServicePayload {
  name: string
  description: string | null
  durationMinutes: number
  isActive: boolean
}

export interface SchedulePayload {
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}
