import { prisma } from '~~/lib/prisma'
import { requireAdmin } from '~~/server/utils/rbac'
import { parseBody } from '~~/server/utils/validation'
import { doctorSchema } from '~~/shared/validation/admin'
import { throwPrismaError } from '~~/server/utils/prisma-error'
import { uniqueSlug } from '~~/server/utils/slug'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, doctorSchema)
  const slug = await uniqueSlug(String(data.name), async (candidate) => Boolean(await prisma.doctor.findUnique({ where: { slug: candidate } })))
  try {
    const doctor = await prisma.doctor.create({
      data: { ...data, slug } as never,
      include: { specialization: true, schedules: true }
    })
    setResponseStatus(event, 201)
    return doctor
  } catch (error) {
    throwPrismaError(error)
  }
})
