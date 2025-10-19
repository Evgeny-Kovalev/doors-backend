import { ProductType as ProductTypePrisma } from '@prisma/client';
import { z } from 'zod';
import { AttributeSchema } from './attributes';
import { CategorySchema } from './categories';
import { VariantSchema } from './product-variants';

export const ProductBaseSchema = z.object({
	id: z.number(),
	slug: z.string(),
	name: z.string(),
	imgUrl: z.string(),
	description: z.string(),
	isVisible: z.boolean().default(true),
	productType: z.enum(ProductTypePrisma).default('full'),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const ProductSchema = ProductBaseSchema.extend({
	category: CategorySchema,
	variants: z.array(VariantSchema),
	params: z.array(AttributeSchema),
}).meta({
	title: 'Product',
});

export const ProductQuerySchema = z.object({
	categorySlug: z.string().optional(),
	q: z.string().optional(),
});

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
		categoryId: z.number(),
		paramIds: z.array(z.number()),
	})
	.meta({
		title: 'Product Create',
	});

export type ProductCreateType = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductBaseSchema.omit({ id: true })
	.extend({
		categoryId: z.number(),
		paramIds: z.array(z.number()),
	})
	.partial()
	.meta({
		title: 'Product Update',
	});

export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>;
