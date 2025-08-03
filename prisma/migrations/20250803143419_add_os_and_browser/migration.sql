/*
  Warnings:

  - You are about to drop the column `timezone` on the `Click` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Click" DROP COLUMN "timezone",
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "os" TEXT;
