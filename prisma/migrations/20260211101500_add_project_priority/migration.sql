-- CreateEnum
CREATE TYPE "ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Project"
ADD COLUMN "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM';
