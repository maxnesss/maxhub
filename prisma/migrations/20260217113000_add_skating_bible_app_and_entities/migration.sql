-- AlterEnum
ALTER TYPE "AppCode" ADD VALUE 'SKATING_BIBLE';

-- CreateEnum
CREATE TYPE "SkatingBibleTaskGroup" AS ENUM (
  'PLANNING',
  'RESEARCH',
  'BUILD',
  'RELEASE'
);

-- CreateEnum
CREATE TYPE "SkatingBibleTaskStatus" AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE'
);

-- CreateTable
CREATE TABLE "SkatingBibleOverview" (
  "id" TEXT NOT NULL,
  "projectName" TEXT NOT NULL DEFAULT 'Skating bible',
  "summary" TEXT NOT NULL DEFAULT '',
  "focus" TEXT NOT NULL DEFAULT '',
  "nextMilestone" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SkatingBibleOverview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkatingBibleIdea" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SkatingBibleIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkatingBibleTask" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "details" TEXT,
  "taskGroup" "SkatingBibleTaskGroup" NOT NULL,
  "status" "SkatingBibleTaskStatus" NOT NULL DEFAULT 'TODO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SkatingBibleTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkatingBibleIdea_createdAt_idx" ON "SkatingBibleIdea"("createdAt");

-- CreateIndex
CREATE INDEX "SkatingBibleTask_taskGroup_status_idx" ON "SkatingBibleTask"("taskGroup", "status");

-- CreateIndex
CREATE INDEX "SkatingBibleTask_status_idx" ON "SkatingBibleTask"("status");
