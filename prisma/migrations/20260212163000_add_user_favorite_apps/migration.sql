-- AlterTable
ALTER TABLE "User"
ADD COLUMN "favoriteApps" "AppCode"[] NOT NULL DEFAULT ARRAY[]::"AppCode"[];
