/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `AttributeKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AttributeKey" DROP COLUMN "imgUrl";

-- AlterTable
ALTER TABLE "AttributeValue" ADD COLUMN     "imgUrl" TEXT;
