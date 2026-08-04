import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	createPaginatedSchema,
	ProductBulkUpdateSchema,
	ProductCreateSchema,
	ProductImportSchema,
	ProductImportProgressEventSchema,
	ProductImportDoneEventSchema,
	ProductImportErrorEventSchema,
	ProductSchema,
	ProductWithSeoSchema,
	ProductUpdateSchema,
	ProductMultipartUpdateSchema,
	ProductQuerySchema,
	RandomProductsQuerySchema,
	ExportProductsQuerySchema,
} from '@/contracts';

export class ProductDto extends createZodDto(ProductSchema) {}
export class ProductWithSeoDto extends createZodDto(ProductWithSeoSchema) {}

export class ProductCreateDto extends createZodDto(ProductCreateSchema) {}

export class ProductUpdateDto extends createZodDto(ProductUpdateSchema) {}

export class ProductMultipartUpdateDto extends createZodDto(
	ProductMultipartUpdateSchema,
) {}

export class ProductBulkUpdateDto extends createZodDto(ProductBulkUpdateSchema) {}

export class ProductQueryDto extends createZodDto(ProductQuerySchema) {}

export class ProductImportDto extends createZodDto(ProductImportSchema) {}

export class ProductImportProgressEventDto extends createZodDto(
	ProductImportProgressEventSchema,
) {}

export class ProductImportDoneEventDto extends createZodDto(
	ProductImportDoneEventSchema,
) {}

export class ProductImportErrorEventDto extends createZodDto(
	ProductImportErrorEventSchema,
) {}

export class PaginatedProductDto extends createZodDto(
	createPaginatedSchema(ProductSchema),
) {}

export class RandomProductsQueryDto extends createZodDto(RandomProductsQuerySchema) {}

export class ExportProductsQueryDto extends createZodDto(ExportProductsQuerySchema) {}
