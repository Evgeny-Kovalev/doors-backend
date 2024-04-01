import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CategoryDto } from 'src/categories/dto';
import { ProductDto } from 'src/products/dto/product.dto';

export class CollectionDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	title: string;

	@ApiProperty({ type: [CategoryDto] })
	categories: CategoryDto[];

	@ApiProperty({ type: [ProductDto] })
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
