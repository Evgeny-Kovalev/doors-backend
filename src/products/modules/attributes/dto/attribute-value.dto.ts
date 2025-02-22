import {
	AttributeValueCreateSchema,
	AttributeValueSchema,
} from '../../../../../contracts';
import { createZodDto } from 'nestjs-zod';

export class AttributeValueDto extends createZodDto(AttributeValueSchema) {}
export class AttributeValueCreateDto extends createZodDto(AttributeValueCreateSchema) {}
