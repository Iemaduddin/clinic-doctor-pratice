export interface DemoDoctor {
  id: string
  name: string
  photoUrl: string | null
  slotDurationMinutes: number
  specialization: { id: string; name: string }
  schedules: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>
}

export interface DemoService {
  id: string
  name: string
  durationMinutes: number
}

export interface DemoAppointment {
  id: string
  bookingCode: string
  startAt: string
  endAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  note: string | null
  doctorId: string
  doctor: { name: string; photoUrl: string | null; specialization: { name: string } }
  service: { name: string; durationMinutes: number }
  patient: { name: string; phone: string; email: string | null }
}

export interface DemoSlot {
  time: string
  startAt: string
  available: boolean
}

const STORAGE_KEY = 'klinik-sehat-demo-appointments'
const ACTIVE_STATUSES: DemoAppointment['status'][] = ['PENDING', 'CONFIRMED']

function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function jakartaDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

function jakartaTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date())
}

function readAll(): DemoAppointment[] {
  if (!import.meta.client) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(items: DemoAppointment[]) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function overlapping(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart
}

function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'KS-'
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  return code
}

export function demoSlots(doctor: DemoDoctor, date: string): DemoSlot[] {
  const dayOfWeek = new Date(`${date}T12:00:00+07:00`).getUTCDay()
  const dayStart = Date.parse(`${date}T00:00:00+07:00`)
  const dayEnd = dayStart + 24 * 60 * 60 * 1000
  const booked = readAll()
    .filter(item => item.doctorId === doctor.id && ACTIVE_STATUSES.includes(item.status))
    .map(item => ({ start: Date.parse(item.startAt), end: Date.parse(item.endAt) }))
    .filter(item => item.end > dayStart && item.start < dayEnd)
  const isToday = date === jakartaDate()
  const nowMinutes = timeToMinutes(jakartaTime())
  const duration = doctor.slotDurationMinutes
  const slots: DemoSlot[] = []

  for (const schedule of doctor.schedules.filter(item => item.dayOfWeek === dayOfWeek)) {
    let start = timeToMinutes(schedule.startTime)
    const end = timeToMinutes(schedule.endTime)
    while (start + duration <= end) {
      const time = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
      const startAt = `${date}T${time}:00+07:00`
      const startMs = Date.parse(startAt)
      const endMs = startMs + duration * 60 * 1000
      const isBooked = booked.some(item => overlapping(startMs, endMs, item.start, item.end))
      slots.push({ time, startAt, available: !isBooked && !(isToday && start <= nowMinutes) })
      start += duration
    }
  }

  return slots
}

export function demoAppointment(code: string) {
  return readAll().find(item => item.bookingCode === code.toUpperCase())
}

export function demoCreateAppointment(input: {
  doctor: DemoDoctor
  service: DemoService
  date: string
  startTime: string
  patientName: string
  patientPhone: string
  patientEmail: string | null
  note: string | null
}) {
  const duration = input.service.durationMinutes || input.doctor.slotDurationMinutes
  const startAt = new Date(`${input.date}T${input.startTime}:00+07:00`)
  const endAt = new Date(startAt.getTime() + duration * 60 * 1000)
  const code = generateBookingCode()
  const appointment: DemoAppointment = {
    id: crypto.randomUUID(),
    bookingCode: code,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    status: 'PENDING',
    note: input.note,
    doctorId: input.doctor.id,
    doctor: {
      name: input.doctor.name,
      photoUrl: input.doctor.photoUrl,
      specialization: { name: input.doctor.specialization.name }
    },
    service: { name: input.service.name, durationMinutes: duration },
    patient: { name: input.patientName, phone: input.patientPhone, email: input.patientEmail }
  }
  writeAll([...readAll(), appointment])
  return appointment
}

export function demoCancelAppointment(code: string, phone: string) {
  const items = readAll()
  const index = items.findIndex(item => item.bookingCode === code.toUpperCase())
  const appointment = items[index]
  if (!appointment) throw new Error('Reservasi tidak ditemukan')
  if (appointment.patient.phone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
    throw new Error('Nomor WhatsApp tidak sesuai')
  }
  items[index] = { ...appointment, status: 'CANCELLED' }
  writeAll(items)
  return items[index]
}
