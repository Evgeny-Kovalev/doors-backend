import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	VariantSchema,
	VariantCreateSchema,
	VariantBulkCreateSchema,
	VariantUpdateSchema,
	VariantBulkUpdateSchema,
	VariantMultipartUpdateSchema,
	VariantQuerySchema,
} from '@/contracts';

export class VariantDto extends createZodDto(VariantSchema) {}
export class VariantCreateDto extends createZodDto(VariantCreateSchema) {}
export class VariantBulkCreateDto extends createZodDto(VariantBulkCreateSchema) {}
export class VariantUpdateDto extends createZodDto(VariantUpdateSchema) {}
export class VariantBulkUpdateDto extends createZodDto(VariantBulkUpdateSchema) {}
export class VariantMultipartUpdateDto extends createZodDto(
	VariantMultipartUpdateSchema,
) {}
export class VariantQueryDto extends createZodDto(VariantQuerySchema) {}
