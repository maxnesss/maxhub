-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppCode" AS ENUM ('PROJECTS', 'TASKS', 'CALENDAR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "UserAppPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "app" "AppCode" NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAppPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAppPermission_app_idx" ON "UserAppPermission"("app");

-- CreateIndex
CREATE UNIQUE INDEX "UserAppPermission_userId_app_key" ON "UserAppPermission"("userId", "app");

-- AddForeignKey
ALTER TABLE "UserAppPermission" ADD CONSTRAINT "UserAppPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
