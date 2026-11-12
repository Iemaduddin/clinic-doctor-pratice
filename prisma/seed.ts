import { fakerID_ID as faker } from '@faker-js/faker'
import { Role } from '@prisma/client'
import { auth } from '../lib/auth'
import { prisma } from '../lib/prisma'

faker.seed(20261106)

async function ensureUser(email: string, name: string, role: Role, phone: string) {
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data: { name, role, phone } })
  }

  const result = await auth.api.signUpEmail({ body: { email, password: 'password', name } })
  return prisma.user.update({ where: { id: result.user.id }, data: { role, phone } })
}

async function seedUsers() {
  const users = [
    { email: 'superadmin@kliniksehat.id', name: 'Super Admin', role: Role.SUPER_ADMIN, phone: '+6281200000001' },
    ...Array.from({ length: 2 }, (_, index) => ({
      email: `${faker.helpers.slugify(faker.person.fullName()).toLowerCase()}@kliniksehat.id`,
      name: faker.person.fullName(),
      role: Role.CLINIC_ADMIN,
      phone: `+628120000000${index + 2}`
    })),
    ...Array.from({ length: 50 }, (_, index) => ({
      email: `${faker.helpers.slugify(faker.person.fullName()).toLowerCase()}@example.com`,
      name: faker.person.fullName(),
      role: Role.PATIENT,
      phone: `+62813${String(index + 1).padStart(8, '0')}`
    }))
  ]

  for (const user of users) await ensureUser(user.email, user.name, user.role, user.phone)
}

async function seedClinicContent() {
  const specializations = [
    { name: 'Penyakit Dalam', slug: 'penyakit-dalam', description: 'Pemeriksaan dan perawatan kesehatan organ dalam untuk pasien dewasa.' },
    { name: 'Kesehatan Anak', slug: 'kesehatan-anak', description: 'Pemantauan tumbuh kembang dan kesehatan bayi serta anak.' },
    { name: 'Dokter Umum', slug: 'dokter-umum', description: 'Konsultasi kesehatan umum dan pemeriksaan awal.' }
  ]

  for (const item of specializations) {
    await prisma.specialization.upsert({
      where: { slug: item.slug },
      update: { name: item.name, description: item.description },
      create: item
    })
  }

  const specializationMap = Object.fromEntries(
    (await prisma.specialization.findMany({ where: { slug: { in: specializations.map((item) => item.slug) } } })).map((item) => [item.slug, item.id])
  )

  const doctors = [
    {
      slug: 'maya-prameswari',
      name: 'dr. Maya Prameswari, Sp.PD',
      specializationSlug: 'penyakit-dalam',
      bio: 'Dokter spesialis penyakit dalam dengan pengalaman menangani pemeriksaan kesehatan dewasa dan penyakit kronis.',
      photoUrl: '/images/doctors/maya-prameswari.jpg',
      slotDurationMinutes: 30,
      schedules: [{ dayOfWeek: 1, startTime: '08:00', endTime: '12:00' }, { dayOfWeek: 3, startTime: '08:00', endTime: '12:00' }, { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' }]
    },
    {
      slug: 'adrian-nugroho',
      name: 'dr. Adrian Nugroho, Sp.A',
      specializationSlug: 'kesehatan-anak',
      bio: 'Dokter spesialis anak yang berfokus pada pemantauan tumbuh kembang dan kesehatan anak.',
      photoUrl: '/images/doctors/adrian-nugroho.jpg',
      slotDurationMinutes: 30,
      schedules: [{ dayOfWeek: 2, startTime: '14:00', endTime: '18:00' }, { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' }, { dayOfWeek: 6, startTime: '14:00', endTime: '18:00' }]
    },
    {
      slug: 'sinta-maharani',
      name: 'dr. Andri Febrian',
      specializationSlug: 'dokter-umum',
      bio: 'Dokter umum untuk konsultasi kesehatan keluarga dan pemeriksaan rutin.',
      photoUrl: '/images/doctors/andri-febrian.jpg',
      slotDurationMinutes: 30,
      schedules: [{ dayOfWeek: 2, startTime: '08:00', endTime: '12:00' }, { dayOfWeek: 4, startTime: '08:00', endTime: '12:00' }, { dayOfWeek: 6, startTime: '08:00', endTime: '12:00' }]
    }
  ]

  for (const [index, item] of doctors.entries()) {
    const doctorUser = await ensureUser(
      `${item.slug}@kliniksehat.id`,
      item.name,
      Role.DOCTOR,
      `+62815${String(index + 1).padStart(8, '0')}`
    )
    const doctor = await prisma.doctor.upsert({
      where: { slug: item.slug },
      update: {
        userId: doctorUser.id,
        name: item.name,
        specializationId: specializationMap[item.specializationSlug],
        bio: item.bio,
        photoUrl: item.photoUrl,
        slotDurationMinutes: item.slotDurationMinutes,
        isActive: true
      },
      create: {
        userId: doctorUser.id,
        slug: item.slug,
        name: item.name,
        specializationId: specializationMap[item.specializationSlug],
        bio: item.bio,
        photoUrl: item.photoUrl,
        slotDurationMinutes: item.slotDurationMinutes,
        isActive: true
      }
    })

    for (const schedule of item.schedules) {
      await prisma.doctorSchedule.upsert({
        where: { doctorId_dayOfWeek_startTime: { doctorId: doctor.id, dayOfWeek: schedule.dayOfWeek, startTime: schedule.startTime } },
        update: { endTime: schedule.endTime, isActive: true },
        create: { ...schedule, doctorId: doctor.id, isActive: true }
      })
    }
  }

  const services = [
    { name: 'Konsultasi Penyakit Dalam', slug: 'konsultasi-penyakit-dalam', description: 'Konsultasi dan pemeriksaan kesehatan untuk keluhan penyakit dalam.', durationMinutes: 30 },
    { name: 'Konsultasi Kesehatan Anak', slug: 'konsultasi-kesehatan-anak', description: 'Konsultasi tumbuh kembang, imunisasi, dan keluhan kesehatan anak.', durationMinutes: 30 },
    { name: 'Pemeriksaan Kesehatan Umum', slug: 'pemeriksaan-kesehatan-umum', description: 'Pemeriksaan awal dan konsultasi kesehatan untuk seluruh keluarga.', durationMinutes: 30 }
  ]

  for (const item of services) {
    await prisma.medicalService.upsert({
      where: { slug: item.slug },
      update: { name: item.name, description: item.description, durationMinutes: item.durationMinutes, isActive: true },
      create: { ...item, isActive: true }
    })
  }

  await prisma.clinicProfile.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Klinik Sehat',
      tagline: 'Perawatan terpercaya, setiap hari',
      about: 'Klinik keluarga dengan layanan kesehatan yang berfokus pada kenyamanan, komunikasi terbuka, dan perawatan yang penuh perhatian.',
      address: 'Jl. Melati Raya No. 18, Kebayoran Baru, Jakarta Selatan',
      phone: '+6281234567890',
      whatsapp: '+6281234567890',
      email: 'halo@kliniksehat.id',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jl.+Melati+Raya+No.+18+Kebayoran+Baru+Jakarta+Selatan',
      timezone: 'Asia/Jakarta'
    }
  })

  const facilities = [
    { id: 'facility-waiting-room', name: 'Ruang tunggu', description: 'Area nyaman untuk pasien dan keluarga.', imageUrl: '/images/facilities/ruang-tunggu.jpg', sortOrder: 1 },
    { id: 'facility-consultation-room', name: 'Ruang konsultasi', description: 'Ruang privat untuk berbincang dengan tenaga medis.', imageUrl: '/images/facilities/ruang-konsultasi.jpg', sortOrder: 2 },
    { id: 'facility-examination-room', name: 'Area pemeriksaan', description: 'Area pemeriksaan dasar yang terjaga kebersihannya.', imageUrl: '/images/facilities/area-pemeriksaan.jpg', sortOrder: 3 }
  ]

  for (const item of facilities) {
    await prisma.clinicFacility.upsert({ where: { id: item.id }, update: item, create: item })
  }

  const testimonials = [
    { patientName: 'Rina Hartono', content: 'Saya merasa didengarkan dan mendapat penjelasan yang mudah dipahami.', rating: 5 },
    { patientName: 'Budi Santoso', content: 'Proses membuat janji terasa mudah dan waktu tunggunya singkat.', rating: 5 }
  ]

  for (const item of testimonials) {
    const existingTestimonial = await prisma.testimonial.findFirst({ where: { patientName: item.patientName } })
    if (existingTestimonial) {
      await prisma.testimonial.update({ where: { id: existingTestimonial.id }, data: { ...item, isPublished: true } })
    } else {
      await prisma.testimonial.create({ data: { ...item, isPublished: true } })
    }
  }

  const faqs = [
    { question: 'Apakah harus membuat janji sebelum datang?', answer: 'Kami menyarankan pasien membuat janji terlebih dahulu agar jadwal dokter dapat dipastikan dan waktu tunggu lebih singkat.' },
    { question: 'Bagaimana cara mengubah atau membatalkan reservasi?', answer: 'Gunakan kode reservasi dan nomor WhatsApp yang terdaftar untuk melihat atau membatalkan reservasi. Untuk bantuan, hubungi tim klinik.' },
    { question: 'Apa yang perlu dibawa saat berkunjung?', answer: 'Bawa identitas diri, daftar obat yang sedang digunakan, serta hasil pemeriksaan sebelumnya bila tersedia.' },
    { question: 'Bagaimana mengetahui biaya konsultasi?', answer: 'Hubungi tim klinik sebelum kunjungan untuk mendapatkan informasi biaya sesuai layanan yang dipilih.' }
  ]

  for (const [index, item] of faqs.entries()) {
    const existingFaq = await prisma.faq.findFirst({ where: { question: item.question } })
    if (existingFaq) {
      await prisma.faq.update({ where: { id: existingFaq.id }, data: { ...item, sortOrder: index + 1, isPublished: true } })
    } else {
      await prisma.faq.create({ data: { ...item, sortOrder: index + 1, isPublished: true } })
    }
  }
}

Promise.all([seedUsers(), seedClinicContent()])
  .then(async () => {
    console.log('Seed selesai: akun dan data klinik siap.')
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('Seed gagal:', error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  })
