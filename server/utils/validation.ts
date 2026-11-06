import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

export async function parseBody<T>(event: H3Event, schema: ZodType<T>) {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data tidak valid',
      data: {
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      }
    })
  }

  return result.data
}
