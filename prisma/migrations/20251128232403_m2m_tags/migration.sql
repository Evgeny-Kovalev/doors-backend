/*
  Warnings:

  - You are about to drop the column `productVariantId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_productVariantId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "productVariantId";

-- CreateTable
CREATE TABLE "_ProductVariantToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantToTag_AB_unique" ON "_ProductVariantToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantToTag_B_index" ON "_ProductVariantToTag"("B");

-- AddForeignKey
ALTER TABLE "_ProductVariantToTag" ADD CONSTRAINT "_ProductVariantToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariantToTag" ADD CONSTRAINT "_ProductVariantToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
