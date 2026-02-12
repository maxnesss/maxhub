-- CreateTable
CREATE TABLE "BambooCapitalScenario" (
  "id" TEXT NOT NULL,
  "operatingMonths" INTEGER NOT NULL DEFAULT 3,
  "reservePercent" INTEGER NOT NULL DEFAULT 25,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BambooCapitalScenario_pkey" PRIMARY KEY ("id")
);
