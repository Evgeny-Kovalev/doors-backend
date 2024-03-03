import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../models/Product.entity';
import { VariantDto } from './variant.dto';

export class ProductDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	imgPath: string;

	@ApiProperty()
	description: string;

	@ApiProperty()
	isVisible: boolean;

	@ApiProperty({ type: [VariantDto] })
	variants: VariantDto[];

	public static fromEntity(p: Product): ProductDto {
		const dto: ProductDto = {
			...p,
			variants: p.variants.map((v) => VariantDto.fromEntity(v)),
		};
		return dto;
	}

	// attributes: AttributeDto[];
}

export class ProductCreateDto {
	@ApiProperty({ example: 'test product name' })
	name: string;

	@ApiProperty({ example: 'test image path' })
	imgPath: string;

	@ApiProperty({ example: 'test product desc' })
	description: string;

	@ApiProperty({ example: false })
	isVisible?: boolean;
}

export class ProductUpdateDto {
	@ApiProperty({ example: 'New Product name' })
	name?: string;

	@ApiProperty({ example: 'New Product image path' })
	imgPath?: string;

	@ApiProperty({ example: 'New Product desc' })
	description?: string;

	@ApiProperty({ example: false })
	isVisible?: boolean;
}

export class ProductQueryDto {
	@ApiProperty({ required: false })
	categoryId?: number;

	@ApiProperty({ example: 'Product name 1', required: false })
	q?: string;
}

export class ProductImportDto {
	// @ApiProperty({ example: 3, required: false })
	// categoryId: number;

	@ApiProperty({ example: 'test.csv', required: true })
	fileName: string;
}
