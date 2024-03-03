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

export type ProductFromFile = { [key: string]: string };
