import { ApiProperty } from '@nestjs/swagger';
import { ProductVariant } from '../models/ProductVariant.entity';
import { AttributeDto } from './attribute.dto';

export class VariantDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	imgPath: string;

	@ApiProperty()
	price: number;

	@ApiProperty({ type: Number, nullable: true })
	discountPrice?: number | null = null;

	@ApiProperty({ type: [AttributeDto] })
	attributes: AttributeDto[];

	public static fromEntity(v: ProductVariant): VariantDto {
		const dto: VariantDto = {
			id: v.id,
			imgPath: v.imgPath,
			price: v.price,
			discountPrice: v.discountPrice,
			attributes: v.attributes.map((a) => AttributeDto.fromEntity(a)),
		};
		return dto;
	}
}

export class VariantCreateDto {
	@ApiProperty({ example: 1 })
	productId: number;

	@ApiProperty({ example: 'image path 1' })
	imgPath: string;

	@ApiProperty({ example: 100 })
	price?: number;

	@ApiProperty({ example: 10 })
	discountPrice?: number;

	@ApiProperty({ type: [Number], example: [1, 3] })
	attributeIds: number[];
}

export class VariantUpdateDto {
	@ApiProperty({ example: 'new image path' })
	imgPath?: string;

	@ApiProperty({ example: 300 })
	price?: number;

	@ApiProperty({ type: Number, nullable: true, example: 150 })
	discountPrice?: number;

	@ApiProperty({ type: [Number], example: [1, 3] })
	attributeIds?: number[];
}

export class VariantQueryDto {
	@ApiProperty()
	productId: number;
}
