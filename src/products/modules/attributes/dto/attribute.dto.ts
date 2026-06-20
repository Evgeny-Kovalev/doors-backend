import { AttributeCreateSchema, AttributeSchema } from '@/contracts';
import { createZodDto } from '@/app/shared/create-zod-dto';

export class AttributeDto extends createZodDto(AttributeSchema) {}
export class AttributeCreateDto extends createZodDto(AttributeCreateSchema) {}
