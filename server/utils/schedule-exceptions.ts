export interface TimeRange {
  startTime: string
  endTime: string
}

export function timeToMinutes(time: string) {
  const [hour = 0, minute = 0] = time.split(':').map(Number)
  return hour * 60 + minute
}

export function overlaps(start: number, end: number, rangeStart: number, rangeEnd: number) {
  return start < rangeEnd && end > rangeStart
}

export function isWithinOpenRanges(start: number, end: number, ranges: TimeRange[], slotDuration: number) {
  return ranges.some((range) => {
    const rangeStart = timeToMinutes(range.startTime)
    const rangeEnd = timeToMinutes(range.endTime)
    return start >= rangeStart && end <= rangeEnd && (start - rangeStart) % slotDuration === 0
  })
}

export function overlapsAnyRange(start: number, end: number, ranges: TimeRange[]) {
  return ranges.some((range) => overlaps(start, end, timeToMinutes(range.startTime), timeToMinutes(range.endTime)))
}
