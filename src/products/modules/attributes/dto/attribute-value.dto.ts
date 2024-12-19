import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AttributeValueDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	value: string;
}

export class AttributeValueCreateDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	value: string;
}
