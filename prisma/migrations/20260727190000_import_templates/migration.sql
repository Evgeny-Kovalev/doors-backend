-- CreateTable
CREATE TABLE "ImportTemplate" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "info" JSONB NOT NULL,
    "paramsKeysInDoc" TEXT[] NOT NULL,
    "attributesKeysInDoc" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportTemplate_slug_key" ON "ImportTemplate"("slug");
