import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class MainProductKeys {
	@ApiProperty({ example: 'name' })
	nameKey: string;

	@ApiProperty({ example: 'imagePath' })
	imgPathKey: string;

	@ApiProperty({ example: 'price' })
	priceKey: string;

	@ApiProperty({ example: 'discountPrice' })
	discountPriceKey: string;
}

export class ImportTemplate {
	@ApiProperty({ type: MainProductKeys })
	info: MainProductKeys;

	@ApiProperty({ example: ['covering', 'material', 'doorThickness', 'height', 'width'] })
	paramsKeysInDoc: string[];

	@ApiProperty({ example: ['color', 'glassVariant'] })
	attributesKeysInDoc: string[];
}

export type CategoryType = $Enums.CategoryType;

export type ProductVariantFromFile = { [key: string]: string };
