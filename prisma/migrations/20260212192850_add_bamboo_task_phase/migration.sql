-- CreateEnum
CREATE TYPE "BambooTaskPhase" AS ENUM ('PHASE_1_PREPARATION', 'PHASE_2_SETUP', 'PHASE_3_HOT_PRE_START', 'PHASE_4_START');

-- DropIndex
DROP INDEX "BambooTask_category_status_timelineWeek_idx";

-- DropIndex
DROP INDEX "BambooTask_timelineWeek_idx";

-- AlterTable
ALTER TABLE "BambooTask" ADD COLUMN     "phase" "BambooTaskPhase" NOT NULL DEFAULT 'PHASE_1_PREPARATION';

-- CreateIndex
CREATE INDEX "BambooTask_category_status_phase_idx" ON "BambooTask"("category", "status", "phase");

-- CreateIndex
CREATE INDEX "BambooTask_phase_idx" ON "BambooTask"("phase");
