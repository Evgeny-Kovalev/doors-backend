import { CategoryType } from 'src/products/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { arrayOfAll } from '../../utils';

export class CategoryDto {
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
	@IsEnum(arrayOfAll<CategoryType>()(['exteriorDoors', 'interiorDoors']))
	categoryType: CategoryType;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty()
	@IsBoolean()
	isVisible: boolean;

	@ApiProperty({ nullable: true })
	@IsNumber()
	@IsOptional()
	parentCategoryId: number | null;
}

export class CategoryWithSubCategories extends CategoryDto {
	@ApiProperty({ type: [CategoryDto] })
	children: CategoryWithSubCategories[];
}

export class CategoryCreateDto {
	@ApiProperty({ example: 'test category name' })
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
	isVisible?: boolean;

	@ApiProperty({ nullable: true, example: 2 })
	@IsNumber()
	@IsOptional()
	parentId: number | null;
}

export class CategoryUpdateDto {
	@ApiPropertyOptional({ example: 'New Product name' })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({ example: 'slug' })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	slug?: string;

	@ApiPropertyOptional({ example: 'New Product image path' })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	imgUrl?: string;

	@ApiPropertyOptional({ example: 'New Product desc' })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({ example: false })
	@IsBoolean()
	@IsOptional()
	isVisible?: boolean;

	@ApiPropertyOptional({ nullable: true, example: null })
	@IsNumber()
	@IsOptional()
	parentId?: number | null;
}
