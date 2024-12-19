import { ApiProperty } from '@nestjs/swagger';
import { AttributeKeyCreateDto, AttributeKeyDto } from './attribute-key.dto';
import { AttributeValueCreateDto, AttributeValueDto } from './attribute-value.dto';
import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttributeDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@ValidateNested()
	@Type(() => AttributeKeyDto)
	key: AttributeKeyDto;

	@ApiProperty()
	@ValidateNested()
	@Type(() => AttributeValueDto)
	value: AttributeValueDto;
}

export class AttributeCreateDto {
	@ApiProperty()
	@ValidateNested()
	@Type(() => AttributeKeyCreateDto)
	key: AttributeKeyCreateDto;

	@ApiProperty()
	@ValidateNested()
	@Type(() => AttributeValueCreateDto)
	value: AttributeValueCreateDto;
}
