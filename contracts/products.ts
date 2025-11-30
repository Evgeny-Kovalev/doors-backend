import { z } from 'zod';
import type { PaginatedResponse } from './pagination';
import { AttributeSchema } from './attributes';
import { CategorySchema } from './categories';
import { VariantSchema } from './product-variants';

export const ProductTypeSchema = z.enum(['full', 'fullSample', 'doorOnlySample']);
export type ProductType = z.infer<typeof ProductTypeSchema>;

export const ProductBaseSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string().min(2, {
		message: 'Название должно быть не менее 2 символов.',
	}),
	imgUrl: z.string(),
	description: z.string(),
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

export type ProductsPaginatedResponse = PaginatedResponse<typeof ProductSchema>;

export const ProductQuerySchema = z.object({
	categorySlug: z.string().optional(),
	q: z.string().optional(),
	productTypes: z
		.preprocess((val) => {
			if (Array.isArray(val)) return val;
			if (typeof val === 'string') {
				return val
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean);
			}
			return val;
		}, z.array(ProductTypeSchema))
		.optional(),
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export const RandomProductsQuerySchema = z.object({
	categorySlug: z.string(),
	limit: z.coerce.number().optional().default(6),
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

export const ProductUpdateSchema = ProductCreateSchema.partial().meta({
	title: 'Product Update',
});

export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>;
