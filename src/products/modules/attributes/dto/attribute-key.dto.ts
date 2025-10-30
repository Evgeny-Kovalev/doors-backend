import { createZodDto } from 'nestjs-zod';
import {
	AttributeKeyCreateSchema,
	AttributeKeySchema,
	AttributeKeyUpdateSchema,
} from '../../../../../contracts';

export class AttributeKeyDto extends createZodDto(AttributeKeySchema) {}
export class AttributeKeyCreateDto extends createZodDto(AttributeKeyCreateSchema) {}
export class AttributeKeyUpdateDto extends createZodDto(AttributeKeyUpdateSchema) {}
