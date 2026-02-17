-- CreateTable
CREATE TABLE "SkatingBibleTaskGroupEntity" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SkatingBibleTaskGroupEntity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkatingBibleTaskGroupEntity_name_key" ON "SkatingBibleTaskGroupEntity"("name");

-- CreateIndex
CREATE INDEX "SkatingBibleTaskGroupEntity_createdAt_idx" ON "SkatingBibleTaskGroupEntity"("createdAt");

-- AlterTable
ALTER TABLE "SkatingBibleTask" ADD COLUMN "taskGroupId" TEXT;

-- Seed default groups to preserve existing enum-based grouping
INSERT INTO "SkatingBibleTaskGroupEntity" ("id", "name", "createdAt", "updatedAt")
VALUES
  ('skating-group-planning', 'Planning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('skating-group-research', 'Research', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('skating-group-build', 'Build', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('skating-group-release', 'Release', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Backfill relation from enum values
UPDATE "SkatingBibleTask" AS t
SET "taskGroupId" = g."id"
FROM "SkatingBibleTaskGroupEntity" AS g
WHERE g."name" = CASE t."taskGroup"
  WHEN 'PLANNING' THEN 'Planning'
  WHEN 'RESEARCH' THEN 'Research'
  WHEN 'BUILD' THEN 'Build'
  WHEN 'RELEASE' THEN 'Release'
END;

-- Fallback for unexpected values
UPDATE "SkatingBibleTask"
SET "taskGroupId" = 'skating-group-planning'
WHERE "taskGroupId" IS NULL;

-- Tighten constraints after backfill
ALTER TABLE "SkatingBibleTask"
  ALTER COLUMN "taskGroupId" SET NOT NULL;

-- Drop old index and replace with relation-based index
DROP INDEX "SkatingBibleTask_taskGroup_status_idx";

CREATE INDEX "SkatingBibleTask_taskGroupId_status_idx"
ON "SkatingBibleTask"("taskGroupId", "status");

-- AddForeignKey
ALTER TABLE "SkatingBibleTask"
ADD CONSTRAINT "SkatingBibleTask_taskGroupId_fkey"
FOREIGN KEY ("taskGroupId") REFERENCES "SkatingBibleTaskGroupEntity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove enum field and type
ALTER TABLE "SkatingBibleTask" DROP COLUMN "taskGroup";

DROP TYPE "SkatingBibleTaskGroup";
