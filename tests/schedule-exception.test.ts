import assert from 'node:assert/strict'
import test from 'node:test'
import { scheduleExceptionSchema } from '../shared/validation/admin'
import { isWithinOpenRanges, overlapsAnyRange } from '../server/utils/schedule-exceptions'

const base = { doctorId: 'doctor-1', date: '2026-11-07', kind: 'CLOSED' as const }

test('schedule exception validation', () => {
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, reason: '  Leave  ' }).data?.reason, 'Leave')
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, startTime: '09:00', endTime: '12:00' }).success, true)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base }).success, true)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, kind: 'OPEN', startTime: '09:00', endTime: '12:00' }).success, true)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, date: '2026-02-30' }).success, false)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, date: '07-11-2026' }).success, false)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, kind: 'OPEN' }).success, false)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, startTime: '09:00' }).success, false)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, startTime: '12:00', endTime: '09:00' }).success, false)
  assert.equal(scheduleExceptionSchema.safeParse({ ...base, reason: ` ${'x'.repeat(501)} ` }).success, false)
})

test('slot intervals respect session boundaries and closures', () => {
  const sessions = [{ startTime: '09:00', endTime: '12:00' }, { startTime: '14:00', endTime: '16:00' }]
  const closures = [{ startTime: '10:00', endTime: '10:30' }]
  assert.equal(isWithinOpenRanges(540, 570, sessions, 30), true)
  assert.equal(isWithinOpenRanges(555, 585, sessions, 30), false)
  assert.equal(isWithinOpenRanges(690, 720, sessions, 30), true)
  assert.equal(overlapsAnyRange(585, 615, closures), true)
  assert.equal(overlapsAnyRange(630, 660, closures), false)
})
