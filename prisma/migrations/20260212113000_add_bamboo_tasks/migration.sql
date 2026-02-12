-- CreateEnum
CREATE TYPE "BambooTaskCategory" AS ENUM (
  'GENERAL',
  'SETUP_COMPANY',
  'INVENTORY',
  'SHOP',
  'FINANCE',
  'BRAND'
);

-- CreateEnum
CREATE TYPE "BambooTaskStatus" AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'DONE'
);

-- CreateEnum
CREATE TYPE "BambooTaskPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

-- CreateTable
CREATE TABLE "BambooTask" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" "BambooTaskCategory" NOT NULL,
  "subCategory" TEXT,
  "timelineWeek" INTEGER NOT NULL,
  "owner" TEXT NOT NULL,
  "priority" "BambooTaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "BambooTaskStatus" NOT NULL DEFAULT 'TODO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BambooTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BambooTask_category_status_timelineWeek_idx" ON "BambooTask"("category", "status", "timelineWeek");

-- CreateIndex
CREATE INDEX "BambooTask_timelineWeek_idx" ON "BambooTask"("timelineWeek");

-- Seed starter tasks for Bamboo planning
INSERT INTO "BambooTask" (
  "id",
  "title",
  "description",
  "category",
  "subCategory",
  "timelineWeek",
  "owner",
  "priority",
  "status",
  "updatedAt"
)
VALUES
  ('bamboo-task-01', 'Finalize shortlist and run trademark pre-check', 'Take the top 3 names and verify register + domain + social handle availability.', 'BRAND', 'Name and brand', 1, 'Brand', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-02', 'Choose final legal company name', 'Lock the legal name for notary documents and trade license form.', 'SETUP_COMPANY', 'Company setup', 1, 'Founder', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-03', 'Prepare founder and managing director data', 'Collect ID data, specimen signatures, and role confirmations.', 'SETUP_COMPANY', 'Company structure', 1, 'Founder', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-04', 'Draft deed and registered office consent', 'Prepare deed of foundation and office consent attachment.', 'SETUP_COMPANY', 'Legal and compliance', 1, 'Legal', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-05', 'Book notary and submit registration', 'Complete notary appointment and start Commercial Register filing.', 'SETUP_COMPANY', 'Company setup', 2, 'Founder', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-06', 'Open bank account and deposit capital', 'Create bank account, deposit registered capital, save confirmation.', 'FINANCE', 'Finance requirements', 2, 'Finance', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-07', 'Submit trade license application', 'File free trade license for retail and related services.', 'SETUP_COMPANY', 'Legal and compliance', 2, 'Legal', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-08', 'Register income tax and evaluate VAT setup', 'Complete mandatory tax registration and document VAT trigger rules.', 'FINANCE', 'Finance requirements', 3, 'Finance', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-09', 'Set accounting workflow and monthly reporting', 'Pick tool/accountant and define monthly close process.', 'FINANCE', 'Finance setup', 3, 'Finance', 'MEDIUM', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-10', 'Define launch inventory shortlist', 'Pick first wave SKUs and target bands from brainstorm.', 'INVENTORY', 'Inventory brainstorm', 3, 'Inventory', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-11', 'Build producer outreach list (8-12 suppliers)', 'Create supplier list with contacts, sortiment, and risk notes.', 'INVENTORY', 'Producers contact', 4, 'Inventory', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-12', 'Request samples and compare supplier offers', 'Collect MOQ, lead time, certifications, and sample quality feedback.', 'INVENTORY', 'Producers contact', 4, 'Inventory', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-13', 'Create landed-cost model for selected SKUs', 'Model product cost including freight, duty, VAT, and labeling.', 'INVENTORY', 'Inventory budget', 4, 'Finance', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-14', 'Prepare first import shipment checklist', 'Set documents, customs broker contact, and inbound QA process.', 'INVENTORY', 'Import of products', 5, 'Logistics', 'MEDIUM', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-15', 'Define target areas for first physical shop', 'Narrow list to 3-5 city districts and add rationale.', 'SHOP', 'Location', 5, 'Founder', 'MEDIUM', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-16', 'Create rental shortlist with budget fit', 'Collect active listings, note rent, fees, and constraints.', 'SHOP', 'Location', 6, 'Operations', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-17', 'Finalize shop concept and target size', 'Confirm concept, floor size range, and expected customer flow.', 'SHOP', 'Concept', 6, 'Founder', 'MEDIUM', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-18', 'Build detailed setup and monthly shop budget', 'Map one-time setup lines and recurring monthly cost lines.', 'SHOP', 'Budget', 7, 'Finance', 'HIGH', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-19', 'Define launch plan and opening checklist', 'Prepare opening timeline, staffing, and launch marketing sequence.', 'GENERAL', 'Overview', 8, 'Operations', 'MEDIUM', 'TODO', CURRENT_TIMESTAMP),
  ('bamboo-task-20', 'Run final readiness review', 'Check legal, supplier, inventory, location, and budget readiness before go-live.', 'GENERAL', 'Overview', 10, 'Founder', 'HIGH', 'TODO', CURRENT_TIMESTAMP);
