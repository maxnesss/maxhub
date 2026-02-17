-- AlterTable
ALTER TABLE "SkatingBibleOverview"
ADD COLUMN "keyFeatures" TEXT NOT NULL DEFAULT '';

-- Backfill keyFeatures from nextMilestone values for continuity
UPDATE "SkatingBibleOverview"
SET "keyFeatures" = COALESCE("nextMilestone", '')
WHERE "keyFeatures" = '';

-- AlterTable
ALTER TABLE "SkatingBibleOverview"
DROP COLUMN "nextMilestone";
