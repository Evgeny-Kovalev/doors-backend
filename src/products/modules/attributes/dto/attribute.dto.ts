import { AttributeCreateSchema, AttributeSchema } from '../../../../../contracts';
import { createZodDto } from 'nestjs-zod';

export class AttributeDto extends createZodDto(AttributeSchema) {}
export class AttributeCreateDto extends createZodDto(AttributeCreateSchema) {}
