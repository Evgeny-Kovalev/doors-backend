import { CategoryDto } from './../../categories/dto/index';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VariantDto } from '../modules/variants/variant.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AttributeDto } from '../modules/attributes/dto/attribute.dto';
import { ImportTemplate } from '../types';
import { Type } from 'class-transformer';

export class ProductDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	slug: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	imgUrl: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	isVisible: boolean;

	@ApiProperty({ type: CategoryDto })
	category: CategoryDto;

	@ApiProperty({ type: [VariantDto] })
	variants: VariantDto[];

	@ApiProperty({ type: [AttributeDto] })
	params: AttributeDto[];
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

	@ApiProperty({ type: [Number], example: [1, 3] })
	paramIds: number[];
}

export class ProductUpdateDto {
	@ApiProperty({ example: 'New Product slug' })
	slug?: string;

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

	@ApiProperty({ type: [Number], example: [1, 3] })
	paramIds?: number[];
}

export class ProductQueryDto {
	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	categorySlug?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	q?: string;
}

export class ProductImportDto {
	@ApiProperty()
	categoryId: number;

	@ApiProperty({ example: 'test.csv', required: true })
	@IsString()
	fileName: string;

	@ApiProperty()
	template: ImportTemplate;
}
