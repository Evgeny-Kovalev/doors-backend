import { ApiProperty } from '@nestjs/swagger';
import { Attribute } from '../models/Attribute.entity';

export class AttributeDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	value: string;

	public static fromEntity(attribute: Attribute): AttributeDto {
		const dto: AttributeDto = {
			id: attribute.id,
			name: attribute.name,
			value: attribute.value,
		};
		return dto;
	}
}
