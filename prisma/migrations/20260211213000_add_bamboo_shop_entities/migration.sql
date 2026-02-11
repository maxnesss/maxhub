-- CreateTable
CREATE TABLE "BambooShopLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooShopLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BambooShopRentalPlace" (
    "id" TEXT NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL,
    "price" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooShopRentalPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BambooShopWebsite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooShopWebsite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BambooShopConcept" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "concept" TEXT NOT NULL,
    "targetSize" TEXT NOT NULL,
    "targetPriceRange" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooShopConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BambooShopBudgetItem" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "monthlyCost" TEXT NOT NULL,
    "oneTimeCost" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BambooShopBudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BambooShopLocation_normalizedName_key" ON "BambooShopLocation"("normalizedName");

-- CreateIndex
CREATE INDEX "BambooShopRentalPlace_foundAt_idx" ON "BambooShopRentalPlace"("foundAt");

-- CreateIndex
CREATE UNIQUE INDEX "BambooShopWebsite_url_key" ON "BambooShopWebsite"("url");

-- SeedData
INSERT INTO "BambooShopLocation" ("id", "name", "normalizedName", "notes", "createdAt", "updatedAt") VALUES
('bamboo_shop_loc_prague_center', 'Prague city center', 'prague city center', 'High foot traffic, premium rent, strong tourist + local mix.', NOW(), NOW()),
('bamboo_shop_loc_vinohrady', 'Prague Vinohrady', 'prague vinohrady', 'Lifestyle district with design-oriented audience.', NOW(), NOW()),
('bamboo_shop_loc_brno_center', 'Brno center', 'brno center', 'Lower rent than Prague, solid purchasing power.', NOW(), NOW());

INSERT INTO "BambooShopWebsite" ("id", "name", "url", "notes", "createdAt", "updatedAt") VALUES
('bamboo_shop_web_sreality', 'Sreality', 'https://www.sreality.cz', 'Primary Czech portal for commercial listings.', NOW(), NOW()),
('bamboo_shop_web_bezrealitky', 'Bezrealitky', 'https://www.bezrealitky.cz', 'Direct owner listings without agency markup.', NOW(), NOW()),
('bamboo_shop_web_realityidnes', 'Reality iDNES', 'https://reality.idnes.cz', 'Wide selection of office and retail spaces.', NOW(), NOW());

INSERT INTO "BambooShopConcept" ("id", "concept", "targetSize", "targetPriceRange", "createdAt", "updatedAt") VALUES
('default', 'Eco-home boutique focused on bamboo essentials, gift sets, and premium everyday products.', '50-90 m2 with front display + compact back storage', '45,000-90,000 CZK monthly rent (target range)', NOW(), NOW());

INSERT INTO "BambooShopBudgetItem" ("id", "category", "monthlyCost", "oneTimeCost", "notes", "createdAt", "updatedAt") VALUES
('bamboo_budget_rent', 'Rent + services', '45,000-90,000 CZK', '2-3x monthly rent deposit', 'Depends on district and exact size.', NOW(), NOW()),
('bamboo_budget_reconstruction', 'Reconstruction/customization', '-', '250,000-700,000 CZK', 'Shelving, lighting, branding, fitting room/storage prep.', NOW(), NOW()),
('bamboo_budget_equipment', 'POS + equipment', '-', '60,000-180,000 CZK', 'POS, security, packaging station, basic office setup.', NOW(), NOW());
