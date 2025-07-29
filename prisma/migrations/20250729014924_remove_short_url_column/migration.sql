/*
  Warnings:

  - You are about to drop the column `shortUrl` on the `Url` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Url_shortUrl_idx";

-- DropIndex
DROP INDEX "Url_shortUrl_key";

-- AlterTable
ALTER TABLE "Url" DROP COLUMN "shortUrl";
