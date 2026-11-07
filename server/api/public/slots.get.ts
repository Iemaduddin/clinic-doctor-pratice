import { prisma } from '~~/lib/prisma'
import { overlaps, timeToMinutes } from '~~/server/utils/schedule-exceptions'

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

  if (!doctor) return []

  const exceptionDate = new Date(`${dateStr}T00:00:00.000Z`)
  const exceptions = await prisma.doctorScheduleException.findMany({ where: { doctorId, date: exceptionDate } })
  const openRanges = [
    ...doctor.schedules.map(({ startTime, endTime }) => ({ startTime, endTime })),
    ...exceptions.filter((exception) => exception.kind === 'OPEN' && exception.startTime && exception.endTime).map((exception) => ({ startTime: exception.startTime!, endTime: exception.endTime! }))
  ]
  if (!openRanges.length) return []
  const closedRanges = exceptions.filter((exception) => exception.kind === 'CLOSED')
  const closedAllDay = closedRanges.some((exception) => !exception.startTime && !exception.endTime)
  if (closedAllDay) return []
  const closedIntervals = closedRanges.filter((exception) => exception.startTime && exception.endTime).map((exception) => ({ startTime: exception.startTime!, endTime: exception.endTime! }))
  const slotDuration = doctor.slotDurationMinutes
  const dayStartMinutes = Date.parse(`${dateStr}T00:00:00+07:00`)
  const dayEndMinutes = dayStartMinutes + 24 * 60 * 60 * 1000
  const startOfDay = new Date(dayStartMinutes)
  const endOfDay = new Date(dayEndMinutes)

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startAt: { lt: endOfDay },
      endAt: { gt: startOfDay },
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    select: { startAt: true, endAt: true }
  })

  const bookedIntervals = bookedAppointments.map((appointment) => ({
    start: (appointment.startAt.getTime() - dayStartMinutes) / 60000,
    end: (appointment.endAt.getTime() - dayStartMinutes) / 60000
  }))

  const now = new Date()
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const isToday = dateStr === localDate
  const localTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
  const currentWibMinutes = timeToMinutes(localTime)
  const slots: Array<{ time: string; startAt: string; available: boolean }> = []
  const seen = new Set<string>()

  for (const schedule of openRanges) {
    let currentMinutes = timeToMinutes(schedule.startTime)
    const scheduleEndMinutes = timeToMinutes(schedule.endTime)
    const duration = slotDuration

    while (currentMinutes + duration <= scheduleEndMinutes) {
      const h = String(Math.floor(currentMinutes / 60)).padStart(2, '0')
      const m = String(currentMinutes % 60).padStart(2, '0')
      const timeStr = `${h}:${m}`

      const startAtISO = `${dateStr}T${timeStr}:00+07:00`
      const endMinutes = currentMinutes + duration
      const isBooked = bookedIntervals.some((interval) => overlaps(currentMinutes, endMinutes, interval.start, interval.end))
      const isClosed = closedIntervals.some((range) => overlaps(currentMinutes, endMinutes, timeToMinutes(range.startTime), timeToMinutes(range.endTime)))
      const isPast = isToday && currentMinutes <= currentWibMinutes

      if (!seen.has(startAtISO)) {
        slots.push({ time: timeStr, startAt: startAtISO, available: !isBooked && !isClosed && !isPast })
        seen.add(startAtISO)
      }

      currentMinutes += duration
    }
  }

  return slots
})
