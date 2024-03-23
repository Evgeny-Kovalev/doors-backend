import { ApiProperty } from '@nestjs/swagger';

export class AttributeValueDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	value: string;
}

export class AttributeValueCreateDto {
	@ApiProperty()
	value: string;
}
