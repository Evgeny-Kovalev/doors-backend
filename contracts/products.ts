import { ProductType as ProductTypePrisma } from '@prisma/client';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
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
	productType: z.nativeEnum(ProductTypePrisma).default('full'),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const ProductSchema = ProductBaseSchema.extend({
	category: CategorySchema,
	variants: z.array(VariantSchema),
	params: z.array(AttributeSchema),
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
	});

export type ProductCreateType = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductBaseSchema.omit({ id: true })
	.extend({
		categoryId: z.number(),
		paramIds: z.array(z.number()),
	})
	.partial();

export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>;
