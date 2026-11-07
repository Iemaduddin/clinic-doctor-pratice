CREATE TYPE "ScheduleExceptionKind" AS ENUM ('CLOSED', 'OPEN');

CREATE TABLE "DoctorScheduleException" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" "ScheduleExceptionKind" NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorScheduleException_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DoctorScheduleException_doctorId_date_idx" ON "DoctorScheduleException"("doctorId", "date");

ALTER TABLE "DoctorScheduleException" ADD CONSTRAINT "DoctorScheduleException_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
