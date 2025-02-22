import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
	ImportTemplateSchema,
	ProductCreateSchema,
	ProductSchema,
	ProductUpdateSchema,
} from '../../../contracts';

export class ProductDto extends createZodDto(ProductSchema) {}

export class ProductCreateDto extends createZodDto(ProductCreateSchema) {}

export class ProductUpdateDto extends createZodDto(ProductUpdateSchema) {}

export class ProductQueryDto extends createZodDto(
	z
		.object({
			categorySlug: z.string(),
			q: z.string(),
		})
		.partial(),
) {}

export class ProductImportDto extends createZodDto(
	z.object({
		categoryId: z.number(),
		fileName: z.string(),
		template: ImportTemplateSchema,
	}),
) {}

export class ImportTemplate extends createZodDto(ImportTemplateSchema) {}
