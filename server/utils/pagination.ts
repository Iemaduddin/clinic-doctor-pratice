import { getQuery, type H3Event } from 'h3'

export function getPagination(event: H3Event, defaultPageSize = 10) {
  const query = getQuery(event)
  const rawPage = Number(query.page)
  const rawPageSize = Number(query.pageSize)
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1
  const pageSize = [10, 25, 50].includes(rawPageSize) ? rawPageSize : defaultPageSize
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

export function paginate<T>(items: T[], total: number, page: number, pageSize: number) {
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}
