-- CreateTable
CREATE TABLE "SkatingBibleBrainstorm" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SkatingBibleBrainstorm_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "SkatingBibleIdea" ADD COLUMN "brainstormId" TEXT;

-- Seed fallback brainstorm and map existing ideas
INSERT INTO "SkatingBibleBrainstorm" ("id", "title", "updatedAt")
VALUES ('default', 'Main brainstorm', CURRENT_TIMESTAMP);

UPDATE "SkatingBibleIdea"
SET "brainstormId" = 'default'
WHERE "brainstormId" IS NULL;

-- AlterTable
ALTER TABLE "SkatingBibleIdea" ALTER COLUMN "brainstormId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "SkatingBibleBrainstorm_createdAt_idx" ON "SkatingBibleBrainstorm"("createdAt");

-- CreateIndex
CREATE INDEX "SkatingBibleIdea_brainstormId_createdAt_idx" ON "SkatingBibleIdea"("brainstormId", "createdAt");

-- AddForeignKey
ALTER TABLE "SkatingBibleIdea"
ADD CONSTRAINT "SkatingBibleIdea_brainstormId_fkey"
FOREIGN KEY ("brainstormId") REFERENCES "SkatingBibleBrainstorm"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
