import { ApiProperty } from '@nestjs/swagger';
import { ProductFullData } from '../types';
import { VariantDto } from '../modules/variants/variant.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDto implements ProductFullData {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	imgUrl: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	isVisible: boolean;

	@ApiProperty()
	categoryId: number;

	@ApiProperty({ type: [VariantDto] })
	variants: VariantDto[];
}

export class ProductCreateDto {
	@ApiProperty({ example: 'test product name' })
	name: string;

	@ApiProperty({ example: 'test image path' })
	imgUrl: string;

	@ApiProperty({ example: 'test product desc' })
	description: string;

	@ApiProperty({ example: false })
	isVisible?: boolean = true;

	@ApiProperty()
	categoryId: number;
}

export class ProductUpdateDto {
	@ApiProperty({ example: 'New Product name' })
	name?: string;

	@ApiProperty({ example: 'New Product image path' })
	imgUrl?: string;

	@ApiProperty({ example: 'New Product desc' })
	description?: string;

	@ApiProperty({ example: false })
	isVisible?: boolean;

	@ApiProperty()
	categoryId?: number;
}

export class ProductQueryDto {
	@ApiProperty({ required: false })
	@Type(() => Number)
	@IsInt()
	@IsOptional()
	categoryId?: number;

	@ApiProperty({ example: 'Product name 1', required: false })
	@IsString()
	@IsOptional()
	q?: string;
}

export class ProductImportDto {
	// @ApiProperty({ example: 3, required: false })
	// categoryId: number;

	@ApiProperty({ example: 'test.csv', required: true })
	fileName: string;
}
