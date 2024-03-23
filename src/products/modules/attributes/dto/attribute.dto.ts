import { ApiProperty } from '@nestjs/swagger';
import { AttributeKeyCreateDto, AttributeKeyDto } from './attribute-key.dto';
import { AttributeValueCreateDto, AttributeValueDto } from './attribute-value.dto';

export class AttributeDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	key: AttributeKeyDto;

	@ApiProperty()
	value: AttributeValueDto;
}

export class AttributeCreateDto {
	@ApiProperty()
	key: AttributeKeyCreateDto;

	@ApiProperty()
	value: AttributeValueCreateDto;
}
