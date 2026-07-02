-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "_AttributeToProduct" ADD CONSTRAINT "_AttributeToProduct_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AttributeToProduct_AB_unique";

-- AlterTable
ALTER TABLE "_AttributeToProductVariant" ADD CONSTRAINT "_AttributeToProductVariant_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AttributeToProductVariant_AB_unique";

-- AlterTable
ALTER TABLE "_CategoryToCollection" ADD CONSTRAINT "_CategoryToCollection_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryToCollection_AB_unique";

-- AlterTable
ALTER TABLE "_CollectionToProduct" ADD CONSTRAINT "_CollectionToProduct_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CollectionToProduct_AB_unique";

-- AlterTable
ALTER TABLE "_ProductVariantToTag" ADD CONSTRAINT "_ProductVariantToTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductVariantToTag_AB_unique";
