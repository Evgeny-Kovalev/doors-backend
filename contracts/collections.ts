import { z } from 'zod';
import { CategorySchema } from './categories';
import { ProductSchema } from './products';

export const CollectionSchema = z.object({
	id: z.number(),
	title: z.string(),
	categories: z.array(CategorySchema),
	products: z.array(ProductSchema),
});

export type CollectionCreateType = z.infer<typeof CollectionCreateSchema>;

export const CollectionCreateSchema = CollectionSchema.omit({
	id: true,
	categories: true,
}).extend({
	categoryIds: z.array(z.number()),
	productIds: z.array(z.number()),
});

export type CollectionType = z.infer<typeof CollectionSchema>;
