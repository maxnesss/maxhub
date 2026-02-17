-- AlterTable
ALTER TABLE "SkatingBibleIdea" ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE INDEX "SkatingBibleIdea_parentId_createdAt_idx" ON "SkatingBibleIdea"("parentId", "createdAt");

-- AddForeignKey
ALTER TABLE "SkatingBibleIdea"
ADD CONSTRAINT "SkatingBibleIdea_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "SkatingBibleIdea"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
