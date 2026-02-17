-- AlterTable
ALTER TABLE "SkatingBibleOverview"
ADD COLUMN "goal" TEXT NOT NULL DEFAULT '';

-- Backfill existing data
UPDATE "SkatingBibleOverview"
SET "goal" = "focus";

-- Remove legacy column
ALTER TABLE "SkatingBibleOverview"
DROP COLUMN "focus";
