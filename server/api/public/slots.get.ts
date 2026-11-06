import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const doctorId = String(query.doctorId || '').trim()
  const dateStr = String(query.date || '').trim()

  if (!doctorId || !dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parameter doctorId dan date (YYYY-MM-DD) wajib diisi'
    })
  }

  // Parse YYYY-MM-DD in Asia/Jakarta (+07:00)
  const targetDate = new Date(`${dateStr}T00:00:00+07:00`)
  if (isNaN(targetDate.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Tanggal tidak valid' })
  }

  // Get day of week (0=Sunday, 1=Monday ... 6=Saturday)
  // Note: Date constructor with +07:00 correctly gives UTC day vs local day
  // Asia/Jakarta is UTC+7
  const dayOfWeek = new Date(`${dateStr}T12:00:00+07:00`).getUTCDay()

  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, isActive: true },
    select: {
      id: true,
      slotDurationMinutes: true,
      schedules: {
        where: { dayOfWeek, isActive: true },
        orderBy: { startTime: 'asc' }
      }
    }
  })

  if (!doctor || !doctor.schedules.length) {
    return []
  }

  // Find start and end of target day in UTC to query appointments
  const startOfDay = new Date(`${dateStr}T00:00:00+07:00`)
  const endOfDay = new Date(`${dateStr}T23:59:59.999+07:00`)

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startAt: { gte: startOfDay, lte: endOfDay },
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    select: { startAt: true }
  })

  const bookedTimeStrings = new Set(
    bookedAppointments.map((app) => {
      // Format startAt to HH:mm in WIB (+07:00)
      const d = new Date(app.startAt)
      const wibHours = String((d.getUTCHours() + 7) % 24).padStart(2, '0')
      const wibMinutes = String(d.getUTCMinutes()).padStart(2, '0')
      return `${wibHours}:${wibMinutes}`
    })
  )

  const now = new Date()
  const isToday = dateStr === now.toISOString().slice(0, 10)
  const currentWibMinutes = (now.getUTCHours() + 7) * 60 + now.getUTCMinutes()

  const slots: Array<{ time: string; startAt: string; available: boolean }> = []

  for (const schedule of doctor.schedules) {
    const [startH, startM] = schedule.startTime.split(':').map(Number)
    const [endH, endM] = schedule.endTime.split(':').map(Number)

    let currentMinutes = startH * 60 + startM
    const scheduleEndMinutes = endH * 60 + endM
    const duration = doctor.slotDurationMinutes

    while (currentMinutes + duration <= scheduleEndMinutes) {
      const h = String(Math.floor(currentMinutes / 60)).padStart(2, '0')
      const m = String(currentMinutes % 60).padStart(2, '0')
      const timeStr = `${h}:${m}`

      const startAtISO = `${dateStr}T${timeStr}:00+07:00`
      const isBooked = bookedTimeStrings.has(timeStr)
      const isPast = isToday && currentMinutes <= currentWibMinutes

      slots.push({
        time: timeStr,
        startAt: startAtISO,
        available: !isBooked && !isPast
      })

      currentMinutes += duration
    }
  }

  return slots
})
