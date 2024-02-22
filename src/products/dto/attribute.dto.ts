import { ApiProperty } from '@nestjs/swagger';
import { AttributeValue } from '../models/Attribute.entity';

export class AttributeDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	value: string;

	public static fromEntity(v: AttributeValue): AttributeDto {
		const dto: AttributeDto = {
			id: v.id,
			name: v.attribute.name,
			value: v.value,
		};
		return dto;
	}
}
