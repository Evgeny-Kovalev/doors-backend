import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeDto } from '../attributes/dto/attribute.dto';
import {
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsNumber()
	productId: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	imgUrl: string;

	@ApiProperty()
	@IsNumber()
	@IsOptional()
	price: number | null;

	@ApiProperty()
	@IsNumber()
	@IsOptional()
	discountPrice: number | null;

	@ApiProperty({ type: [AttributeDto] })
	@ValidateNested({ each: true })
	@Type(() => AttributeDto)
	attributes: AttributeDto[];
}

export class VariantCreateDto {
	@ApiProperty({ example: 1 })
	@IsNumber()
	productId: number;

	@ApiProperty({ example: 'image path 1' })
	@IsString()
	@IsNotEmpty()
	imgUrl: string;

	@ApiPropertyOptional({ example: 100 })
	@IsNumber()
	@IsOptional()
	price?: number;

	@ApiPropertyOptional({ example: 10 })
	@IsNumber()
	@IsOptional()
	discountPrice?: number;

	@ApiProperty({ type: [Number], example: [1, 3] })
	@IsArray()
	@ArrayMinSize(1)
	@IsNumber({}, { each: true })
	attributeIds: number[];
}

export class VariantUpdateDto {
	@ApiPropertyOptional({ example: 'new image path' })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	imgUrl?: string;

	@ApiPropertyOptional({ example: 300 })
	@IsNumber()
	@IsOptional()
	price?: number;

	@ApiPropertyOptional({ type: Number, nullable: true, example: 150 })
	@IsNumber()
	@IsOptional()
	discountPrice?: number;

	@ApiPropertyOptional({ type: [Number], example: [1, 3] })
	@IsArray()
	@ArrayMinSize(1)
	@IsNumber({}, { each: true })
	attributeIds?: number[];
}

export class VariantQueryDto {
	@ApiProperty()
	@IsNumber()
	productId: number;
}
