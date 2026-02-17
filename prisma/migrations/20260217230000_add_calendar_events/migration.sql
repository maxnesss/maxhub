-- CreateEnum
CREATE TYPE "CalendarEventColor" AS ENUM ('SKY', 'MINT', 'PEACH', 'LEMON', 'LILAC');

-- CreateTable
CREATE TABLE "CalendarEvent" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3),
  "isAllDay" BOOLEAN NOT NULL DEFAULT false,
  "color" "CalendarEventColor" NOT NULL DEFAULT 'SKY',
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEvent_startsAt_idx" ON "CalendarEvent"("startsAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_createdById_startsAt_idx" ON "CalendarEvent"("createdById", "startsAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_color_startsAt_idx" ON "CalendarEvent"("color", "startsAt");

-- AddForeignKey
ALTER TABLE "CalendarEvent"
ADD CONSTRAINT "CalendarEvent_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
