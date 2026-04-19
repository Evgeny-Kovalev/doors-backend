CREATE TYPE "NewsType" AS ENUM ('NEWS', 'PROMOTION');

CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "type" "NewsType" NOT NULL,
    "markdownUrl" TEXT NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
