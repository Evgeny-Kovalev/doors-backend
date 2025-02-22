import { createZodDto } from 'nestjs-zod';
import { AttributeKeyCreateSchema, AttributeKeySchema } from '../../../../../contracts';

export class AttributeKeyDto extends createZodDto(AttributeKeySchema) {}
export class AttributeKeyCreateDto extends createZodDto(AttributeKeyCreateSchema) {}
