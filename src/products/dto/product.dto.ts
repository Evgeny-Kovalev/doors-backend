import { createZodDto } from '@/app/shared/create-zod-dto';
import {
	createPaginatedSchema,
	ProductCreateSchema,
	ProductImportSchema,
	ProductSchema,
	ProductWithSeoSchema,
	ProductUpdateSchema,
	ProductQuerySchema,
	RandomProductsQuerySchema,
	ExportProductsQuerySchema,
} from '@/contracts';

export class ProductDto extends createZodDto(ProductSchema) {}
export class ProductWithSeoDto extends createZodDto(ProductWithSeoSchema) {}

export class ProductCreateDto extends createZodDto(ProductCreateSchema) {}

export class ProductUpdateDto extends createZodDto(ProductUpdateSchema) {}

export class ProductQueryDto extends createZodDto(ProductQuerySchema) {}

export class ProductImportDto extends createZodDto(ProductImportSchema) {}

export class PaginatedProductDto extends createZodDto(
	createPaginatedSchema(ProductSchema),
) {}

export class RandomProductsQueryDto extends createZodDto(RandomProductsQuerySchema) {}

export class ExportProductsQueryDto extends createZodDto(ExportProductsQuerySchema) {}
