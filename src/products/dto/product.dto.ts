import { createZodDto } from 'nestjs-zod';
import {
	ImportTemplateSchema,
	createPaginatedSchema,
	ProductCreateSchema,
	ProductImportSchema,
	ProductSchema,
	ProductUpdateSchema,
	ProductQuerySchema,
	RandomProductsQuerySchema,
} from '../../../contracts';

export class ProductDto extends createZodDto(ProductSchema) {}

export class ProductCreateDto extends createZodDto(ProductCreateSchema) {}

export class ProductUpdateDto extends createZodDto(ProductUpdateSchema) {}

export class ProductQueryDto extends createZodDto(ProductQuerySchema) {}

export class ProductImportDto extends createZodDto(ProductImportSchema) {}

export class ImportTemplate extends createZodDto(ImportTemplateSchema) {}

export class PaginatedProductDto extends createZodDto(
	createPaginatedSchema(ProductSchema),
) {}

export class RandomProductsQueryDto extends createZodDto(RandomProductsQuerySchema) {}
