import assert from 'node:assert/strict'
import { test } from 'node:test'

Object.assign(globalThis, {
  createError: ({ statusCode, statusMessage }: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(statusMessage), { statusCode, statusMessage })
})

const { assertStatusTransition } = await import('../server/utils/appointment-status.ts')

test('allows valid appointment status transitions', () => {
  assert.doesNotThrow(() => assertStatusTransition('PENDING', 'CONFIRMED'))
  assert.doesNotThrow(() => assertStatusTransition('PENDING', 'CANCELLED'))
  assert.doesNotThrow(() => assertStatusTransition('CONFIRMED', 'COMPLETED'))
  assert.doesNotThrow(() => assertStatusTransition('CONFIRMED', 'CANCELLED'))
})

test('rejects invalid and terminal appointment status transitions', () => {
  for (const [current, next] of [
    ['PENDING', 'COMPLETED'],
    ['CONFIRMED', 'PENDING'],
    ['CANCELLED', 'CONFIRMED'],
    ['COMPLETED', 'CANCELLED']
  ]) {
    assert.throws(
      () => assertStatusTransition(current, next),
      (error: Error & { statusCode?: number }) => error.statusCode === 400
    )
  }
})
