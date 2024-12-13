-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('interiorDoors', 'exteriorDoors');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('full', 'fullSample', 'doorOnlySample');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GUEST');

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentCategoryId" INTEGER,
    "categoryType" "CategoryType" NOT NULL DEFAULT 'interiorDoors',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "productType" "ProductType" NOT NULL DEFAULT 'full',
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "price" INTEGER,
    "discountPrice" INTEGER,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attribute" (
    "id" SERIAL NOT NULL,
    "keyId" INTEGER NOT NULL,
    "valueId" INTEGER NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeKey" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imgUrl" TEXT,

    CONSTRAINT "AttributeKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeValue" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['GUEST']::"Role"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToCollection" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToProductVariant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AttributeToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CollectionToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_keyId_valueId_key" ON "Attribute"("keyId", "valueId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeKey_value_key" ON "AttributeKey"("value");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeValue_value_key" ON "AttributeValue"("value");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToCollection_AB_unique" ON "_CategoryToCollection"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToCollection_B_index" ON "_CategoryToCollection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToProductVariant_AB_unique" ON "_AttributeToProductVariant"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToProductVariant_B_index" ON "_AttributeToProductVariant"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttributeToProduct_AB_unique" ON "_AttributeToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_AttributeToProduct_B_index" ON "_AttributeToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToProduct_AB_unique" ON "_CollectionToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToProduct_B_index" ON "_CollectionToProduct"("B");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "AttributeKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "AttributeValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToCollection" ADD CONSTRAINT "_CategoryToCollection_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToCollection" ADD CONSTRAINT "_CategoryToCollection_B_fkey" FOREIGN KEY ("B") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToProductVariant" ADD CONSTRAINT "_AttributeToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToProductVariant" ADD CONSTRAINT "_AttributeToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToProduct" ADD CONSTRAINT "_AttributeToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeToProduct" ADD CONSTRAINT "_AttributeToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToProduct" ADD CONSTRAINT "_CollectionToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToProduct" ADD CONSTRAINT "_CollectionToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
