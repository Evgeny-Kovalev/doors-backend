CREATE TYPE "SeoEntityType" AS ENUM ('category', 'product');

CREATE TABLE "SeoTemplate" (
    "id" SERIAL NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "titleTemplate" TEXT NOT NULL,
    "descriptionTemplate" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeoMetadata" (
    "id" SERIAL NOT NULL,
    "entityType" "SeoEntityType" NOT NULL,
    "entityKey" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMetadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeoTemplate_entityType_key"
ON "SeoTemplate"("entityType");

CREATE UNIQUE INDEX "SeoMetadata_entityType_entityKey_key"
ON "SeoMetadata"("entityType", "entityKey");

INSERT INTO "SeoTemplate" (
    "entityType",
    "titleTemplate",
    "descriptionTemplate",
    "updatedAt"
) VALUES
(
    'product',
    '',
    '',
    CURRENT_TIMESTAMP
),
(
    'category',
    '',
    '',
    CURRENT_TIMESTAMP
);
