-- CreateTable
CREATE TABLE "BambooProjectCharter" (
  "id" TEXT NOT NULL,
  "vision" TEXT NOT NULL,
  "targetCustomer" TEXT NOT NULL,
  "scopeIn" TEXT NOT NULL,
  "scopeOut" TEXT NOT NULL,
  "budgetGuardrail" TEXT NOT NULL,
  "launchCriteria" TEXT NOT NULL,
  "keyRisks" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BambooProjectCharter_pkey" PRIMARY KEY ("id")
);

-- Seed default project charter
INSERT INTO "BambooProjectCharter" (
  "id",
  "vision",
  "targetCustomer",
  "scopeIn",
  "scopeOut",
  "budgetGuardrail",
  "launchCriteria",
  "keyRisks",
  "updatedAt"
)
VALUES (
  'default',
  'Build Bamboo into a focused eco-home retail business with strong unit economics and a scalable operating model.',
  'Urban Czech customers aged 24-45 who value practical, aesthetic, and sustainable home products.',
  'Brand setup, supplier pipeline, import operations, inventory planning, and first shop launch readiness.',
  'Large multi-city expansion, custom product manufacturing, and complex omnichannel rollout before first launch.',
  'Keep setup and early operating commitments within the recommended capital range and review monthly variance.',
  'Legal setup complete, supplier quality validated, launch inventory secured, location selected, and budget runway protected.',
  'Supplier quality variance, customs or import delays, rent-to-revenue mismatch, and weak initial demand validation.',
  CURRENT_TIMESTAMP
);
