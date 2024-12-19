import { CategoryDto } from './../../categories/dto/index';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VariantDto } from '../modules/variants/variant.dto';
import {
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { AttributeDto } from '../modules/attributes/dto/attribute.dto';
import { ImportTemplate } from '../types';
import { ProductType } from '@prisma/client';
import { Type } from 'class-transformer';
import { arrayOfAll } from '../../utils';

export class ProductDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	slug: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	imgUrl: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty()
	@IsBoolean()
	isVisible: boolean;

	@ApiProperty({ example: ProductType.full, enum: ProductType })
	@IsEnum(arrayOfAll<ProductType>()(['full', 'fullSample', 'doorOnlySample']))
	productType: ProductType;

	@ApiProperty({ type: CategoryDto })
	@ValidateNested()
	@Type(() => CategoryDto)
	category: CategoryDto;

	@ApiProperty({ type: [VariantDto] })
	@ValidateNested({ each: true })
	@Type(() => VariantDto)
	variants: VariantDto[];

	@ApiProperty({ type: [AttributeDto] })
	@ValidateNested({ each: true })
	@Type(() => AttributeDto)
	params: AttributeDto[];
}

export class ProductCreateDto {
	@ApiProperty({ example: 'test product name' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: 'test image path' })
	@IsString()
	@IsNotEmpty()
	imgUrl: string;

	@ApiProperty({ example: 'test product desc' })
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiPropertyOptional({ example: false })
	@IsBoolean()
	@IsOptional()
	isVisible?: boolean = true;

	@ApiPropertyOptional({ example: ProductType.full, enum: ProductType })
	@IsEnum(arrayOfAll<ProductType>()(['full', 'doorOnlySample', 'fullSample']))
	@IsOptional()
	productType?: ProductType;

	@ApiProperty()
	@IsNumber()
	categoryId: number;

	@ApiProperty({ type: [Number], example: [1, 3] })
	@IsArray()
	@ArrayMinSize(1)
	@IsNumber({}, { each: true })
	paramIds: number[];
}

export class ProductUpdateDto {
	@ApiPropertyOptional({ example: 'New Product slug' })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	slug?: string;

	@ApiPropertyOptional({ example: 'New Product name' })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({ example: 'New Product image path' })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	imgUrl?: string;

	@ApiPropertyOptional({ example: 'New Product desc' })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	description?: string;

	@ApiPropertyOptional({ example: false })
	@IsBoolean()
	@IsOptional()
	isVisible?: boolean;

	@ApiPropertyOptional({ example: ProductType.doorOnlySample, enum: ProductType })
	@IsEnum(arrayOfAll<ProductType>()(['full', 'doorOnlySample', 'fullSample']))
	@IsOptional()
	productType?: ProductType;

	@ApiPropertyOptional()
	@IsNumber()
	@IsOptional()
	categoryId?: number;

	@ApiPropertyOptional({ type: [Number], example: [1, 3] })
	@IsArray()
	@ArrayMinSize(1)
	@IsNumber({}, { each: true })
	@IsOptional()
	paramIds?: number[];
}

export class ProductQueryDto {
	@ApiPropertyOptional()
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	categorySlug?: string;

	@ApiPropertyOptional()
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	q?: string;
}

export class ProductImportDto {
	@ApiProperty()
	@IsNumber()
	categoryId: number;

	@ApiProperty({ example: 'test.csv', required: true })
	@IsString()
	@IsNotEmpty()
	fileName: string;

	@ApiProperty()
	@ValidateNested()
	@Type(() => ImportTemplate)
	template: ImportTemplate;
}
