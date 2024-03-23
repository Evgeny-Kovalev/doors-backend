import { ApiProperty } from '@nestjs/swagger';
import { AttributeDto } from '../attributes/dto/attribute.dto';

export class VariantDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	productId: number;

	@ApiProperty()
	imgUrl: string;

	@ApiProperty()
	price: number | null;

	@ApiProperty()
	discountPrice: number | null;

	@ApiProperty({ type: [AttributeDto] })
	attributes: AttributeDto[];
}

export class VariantCreateDto {
	@ApiProperty({ example: 1 })
	productId: number;

	@ApiProperty({ example: 'image path 1' })
	imgUrl: string;

	@ApiProperty({ example: 100 })
	price?: number;

	@ApiProperty({ example: 10 })
	discountPrice?: number;

	@ApiProperty({ type: [Number], example: [1, 3] })
	attributeIds: number[];
}

export class VariantUpdateDto {
	@ApiProperty({ example: 'new image path' })
	imgUrl?: string;

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
