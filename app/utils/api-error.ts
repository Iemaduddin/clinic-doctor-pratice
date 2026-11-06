export function apiErrorMessage(error: unknown, fallback = 'Terjadi kesalahan') {
  const value = error as {
    data?: {
      statusMessage?: string
      data?: { errors?: Array<{ message?: string }> }
    }
  }

  return value.data?.data?.errors?.[0]?.message ?? value.data?.statusMessage ?? fallback
}
