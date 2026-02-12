-- CreateTable
CREATE TABLE "BambooInventoryBudget" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "initialInventoryBuy" INTEGER NOT NULL DEFAULT 0,
    "initialTransportation" INTEGER NOT NULL DEFAULT 0,
    "initialTaxesImportFees" INTEGER NOT NULL DEFAULT 0,
    "initialTransportToShop" INTEGER NOT NULL DEFAULT 0,
    "initialLabelling" INTEGER NOT NULL DEFAULT 0,
    "periodicalInventoryBuy" INTEGER NOT NULL DEFAULT 0,
    "periodicalTransportation" INTEGER NOT NULL DEFAULT 0,
    "periodicalTaxesImportFees" INTEGER NOT NULL DEFAULT 0,
    "periodicalTransportToShop" INTEGER NOT NULL DEFAULT 0,
    "periodicalLabelling" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooInventoryBudget_pkey" PRIMARY KEY ("id")
);
