-- CreateTable
CREATE TABLE "BambooInventoryIdea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "targetPriceBand" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooInventoryIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BambooInventoryIdea_normalizedName_key" ON "BambooInventoryIdea"("normalizedName");

-- SeedData
INSERT INTO "BambooInventoryIdea" ("id", "name", "normalizedName", "notes", "targetPriceBand", "createdAt", "updatedAt") VALUES
('bamboo_inventory_kitchen', 'Kitchen and dining', 'kitchen and dining', 'Bamboo cutting boards, utensils, storage organizers, serving trays.', '150-900 CZK', NOW(), NOW()),
('bamboo_inventory_bathroom', 'Bathroom and personal care', 'bathroom and personal care', 'Toothbrushes, soap trays, organizers, reusable accessories.', '80-500 CZK', NOW(), NOW()),
('bamboo_inventory_home', 'Home organization', 'home organization', 'Shelves, boxes, drawer organizers, desk accessories.', '200-1,500 CZK', NOW(), NOW()),
('bamboo_inventory_furniture', 'Furniture and decor', 'furniture and decor', 'Stools, side tables, lamps, minimalist decorative pieces.', '800-5,000 CZK', NOW(), NOW()),
('bamboo_inventory_gifts', 'Gift and bundles', 'gift and bundles', 'Starter eco sets, gift boxes, seasonal bundles.', '350-1,800 CZK', NOW(), NOW());
