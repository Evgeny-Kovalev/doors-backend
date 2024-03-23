import { ApiProperty } from '@nestjs/swagger';

export class AttributeKeyDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	value: string;

	@ApiProperty()
	label: string;

	@ApiProperty({ nullable: true })
	imgUrl: string | null;
}

export class AttributeKeyCreateDto {
	@ApiProperty()
	value: string;

	@ApiProperty()
	label: string;

	@ApiProperty({ nullable: true })
	imgUrl: string | null;
}
