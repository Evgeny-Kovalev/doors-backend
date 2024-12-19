import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AttributeKeyDto {
	@ApiProperty()
	@IsNumber()
	id: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	value: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	label: string;

	@ApiProperty({ nullable: true })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	imgUrl: string | null;
}

export class AttributeKeyCreateDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	value: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	label: string;

	@ApiProperty({ nullable: true })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	imgUrl: string | null;
}
