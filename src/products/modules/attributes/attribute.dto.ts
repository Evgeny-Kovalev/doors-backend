import { ApiProperty } from '@nestjs/swagger';
import { AttributeFullData } from './types';

export class AttributeDto implements AttributeFullData {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	value: string;
}
