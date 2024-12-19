import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CategoryDto } from 'src/categories/dto';
import { ProductDto } from 'src/products/dto/product.dto';

export class CollectionDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ type: [CategoryDto] })
	@ValidateNested({ each: true })
	@Type(() => CategoryDto)
	categories: CategoryDto[];

	@ApiProperty({ type: [ProductDto] })
	@ValidateNested({ each: true })
	@Type(() => CategoryDto)
	products: ProductDto[];
}

export class CollectionCreateDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty({ type: [Number] })
	@IsArray()
	@IsNumber({}, { each: true })
	categoryIds: number[];

	@ApiProperty({ type: [Number] })
	@IsArray()
	@IsNumber({}, { each: true })
	productIds: number[];
}
