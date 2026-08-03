import { z } from 'zod';
import type { PaginatedResponse } from './pagination';
import { AttributeSchema } from './attributes';
import { CategorySchema } from './categories';
import { VariantSchema } from './product-variants';
import { ResolvedSeoMetadataSchema } from './seo';
import { BULK_MAX_ITEMS } from './bulk';

export const ProductTypeSchema = z.enum(['full', 'fullSample', 'doorOnlySample']);
export type ProductType = z.infer<typeof ProductTypeSchema>;

export const ProductBaseSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string().min(2, {
		message: 'Название должно быть не менее 2 символов.',
	}),
	imgUrl: z.string(),
	description: z.string().nullable(),
	isVisible: z.boolean(),
	productType: ProductTypeSchema,
});

export const ProductSchema = ProductBaseSchema.extend({
	category: CategorySchema.optional().nullable(),
	variants: z.array(VariantSchema),
	params: z.array(AttributeSchema),
}).meta({
	title: 'Product',
});

export type ProductResponse = z.infer<typeof ProductSchema>;

export const ProductWithSeoSchema = ProductSchema.extend({
	seo: ResolvedSeoMetadataSchema,
});
export type ProductWithSeoResponse = z.infer<typeof ProductWithSeoSchema>;

export type ProductsPaginatedResponse = PaginatedResponse<typeof ProductSchema>;

export const ProductSortSchema = z.enum(['default', 'name', 'price']);
export type ProductSort = z.infer<typeof ProductSortSchema>;

export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export const ProductQuerySchema = z.object({
	categorySlug: z.string().optional(),
	q: z.string().optional(),
	sort: ProductSortSchema.optional().default('default'),
	order: SortOrderSchema.optional().default('asc'),
	productTypes: z
		.union([
			z.array(ProductTypeSchema),
			z
				.string()
				.transform((val) =>
					val
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean),
				)
				.pipe(z.array(ProductTypeSchema)),
		])
		.optional(),
});

export type ProductQuery = z.input<typeof ProductQuerySchema>;
export type ProductQueryParsed = z.infer<typeof ProductQuerySchema>;

export const RandomProductsQuerySchema = z.object({
	categorySlug: z.string(),
	limit: z.coerce.number().optional().default(6),
});

export const ExportProductsQuerySchema = z.object({
	categorySlug: z.string(),
});

export const ProductCreateSchema = ProductBaseSchema.omit({
	id: true,
	slug: true,
})
	.partial({
		isVisible: true,
		productType: true,
	})
	.extend({
		categoryId: z.number().optional().nullable(),
		paramIds: z.array(z.number()),
	})
	.meta({
		title: 'Product Create',
	});

export type ProductCreateType = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductCreateSchema.partial()
	.meta({
		title: 'Product Update',
	})
	.extend({
		price: z.number().optional().nullable().meta({
			title: 'Price for all variants',
		}),
		discountPrice: z.number().optional().nullable().meta({
			title: 'Discount price for all variants',
		}),
	});

export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>;
export type ExportProductsQueryType = z.infer<typeof ExportProductsQuerySchema>;

export const ProductBulkUpdateItemSchema = ProductUpdateSchema.extend({
	slug: z.string().min(1),
}).meta({
	title: 'Product Bulk Update Item',
});

export const ProductBulkUpdateSchema = z
	.object({
		items: z.array(ProductBulkUpdateItemSchema).min(1).max(BULK_MAX_ITEMS),
	})
	.meta({
		title: 'Product Bulk Update',
	});

export type ProductBulkUpdateItemType = z.infer<typeof ProductBulkUpdateItemSchema>;
export type ProductBulkUpdateType = z.infer<typeof ProductBulkUpdateSchema>;
