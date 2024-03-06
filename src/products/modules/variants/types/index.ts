import { Prisma } from '@prisma/client';

const variantAllData = Prisma.validator<Prisma.ProductVariantDefaultArgs>()({
	include: { attributes: true },
});

export interface VariantFullData
	extends Prisma.ProductVariantGetPayload<typeof variantAllData> {}
