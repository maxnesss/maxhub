-- CreateTable
CREATE TABLE "BambooNameIdea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "shortlisted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooNameIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BambooNameIdea_normalizedName_key" ON "BambooNameIdea"("normalizedName");

-- CreateIndex
CREATE INDEX "BambooNameIdea_category_idx" ON "BambooNameIdea"("category");

-- CreateIndex
CREATE INDEX "BambooNameIdea_shortlisted_idx" ON "BambooNameIdea"("shortlisted");
