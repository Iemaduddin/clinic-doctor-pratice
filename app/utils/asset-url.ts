export function assetUrl(path: string | null | undefined) {
  if (!path) return ''
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path
  const base = useRuntimeConfig().app.baseURL || '/'
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
