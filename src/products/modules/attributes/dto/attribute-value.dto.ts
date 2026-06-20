import {
	AttributeValueCreateSchema,
	AttributeValueSchema,
	AttributeValueUpdateSchema,
} from '@/contracts';
import { createZodDto } from '@/app/shared/create-zod-dto';

export class AttributeValueDto extends createZodDto(AttributeValueSchema) {}
export class AttributeValueCreateDto extends createZodDto(AttributeValueCreateSchema) {}
export class AttributeValueUpdateDto extends createZodDto(AttributeValueUpdateSchema) {}
