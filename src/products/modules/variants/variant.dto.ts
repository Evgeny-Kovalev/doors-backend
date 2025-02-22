import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
	VariantSchema,
	VariantCreateSchema,
	VariantUpdateSchema,
} from '../../../../contracts';

export class VariantDto extends createZodDto(VariantSchema) {}
export class VariantCreateDto extends createZodDto(VariantCreateSchema) {}
export class VariantUpdateDto extends createZodDto(VariantUpdateSchema) {}

export class VariantQueryDto extends createZodDto(
	z.object({
		productId: z.number(),
	}),
) {}
