-- CreateTable
CREATE TABLE "BambooDocument" (
  "id" TEXT NOT NULL,
  "objectKey" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BambooDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BambooDocument_objectKey_key" ON "BambooDocument"("objectKey");

-- CreateIndex
CREATE INDEX "BambooDocument_createdAt_idx" ON "BambooDocument"("createdAt");
