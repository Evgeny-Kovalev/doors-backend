/*
  Warnings:

  - A unique constraint covering the columns `[sourceId]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "sourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sourceId_key" ON "ProductVariant"("sourceId");
