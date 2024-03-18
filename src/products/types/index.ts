import { Prisma } from '@prisma/client';

export type MainProductKeys = {
	nameKey: string;
	imgPathKey: string;
	priceKey: string;
	discountPriceKey: string;
};

export type ImportTemplate = {
	info: MainProductKeys;
	paramsKeysInDoc: string[];
	attributesKeysInDoc: string[];
};

export type ProductVariantFromFile = { [key: string]: string };

const productAllData = Prisma.validator<Prisma.ProductDefaultArgs>()({
	include: { params: true, variants: { include: { attributes: true } } },
});

export interface ProductFullData
	extends Prisma.ProductGetPayload<typeof productAllData> {}
